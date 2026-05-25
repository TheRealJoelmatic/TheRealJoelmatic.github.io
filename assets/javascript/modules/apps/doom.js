





window.Site = window.Site || {};

(function () {

  var API_URL = 'https://thedoggybrad.github.io/doom_on_js-dos/js-dos-api.js';
  var ARCHIVE_URL = 'https://thedoggybrad.github.io/doom_on_js-dos/DOOM-@evilution.zip';
  var EXECUTABLE = './DOOM/DOOM.EXE';

  var apiLoading = false;
  var apiWaiters = [];
  var existingWin = null;

  function installMiniDollar() {
    if (typeof window.$ === 'function') return true;

    function toArray(list) {
      return Array.prototype.slice.call(list || []);
    }

    function wrap(nodes) {
      var arr = nodes || [];
      var api = {
        length: arr.length,
        append: function (child) {
          var n = child;
          if (child && child[0] && child[0].nodeType) n = child[0];
          arr.forEach(function (el) { if (n) el.appendChild(n); });
          return api;
        },
        click: function (fn) {
          arr.forEach(function (el) { el.addEventListener('click', fn); });
          return api;
        },
        hide: function () {
          arr.forEach(function (el) { el.style.display = 'none'; });
          return api;
        },
        show: function () {
          arr.forEach(function (el) { el.style.display = ''; });
          return api;
        },
        html: function (value) {
          if (typeof value === 'undefined') return arr[0] ? arr[0].innerHTML : '';
          arr.forEach(function (el) { el.innerHTML = value; });
          return api;
        }
      };
      for (var i = 0; i < arr.length; i++) api[i] = arr[i];
      return api;
    }

    window.$ = function (input) {
      if (typeof input === 'string') {
        var s = input.trim();
        if (s.charAt(0) === '<') {
          var holder = document.createElement('div');
          holder.innerHTML = s;
          return wrap(holder.firstElementChild ? [holder.firstElementChild] : []);
        }
        return wrap(toArray(document.querySelectorAll(s)));
      }
      if (input && input.nodeType) return wrap([input]);
      if (input && typeof input.length === 'number') return wrap(toArray(input));
      return wrap([]);
    };

    if (typeof window.jQuery === 'undefined') window.jQuery = window.$;
    return true;
  }

  function ensureApi(done, fail) {
    if (typeof window.Dosbox === 'function') { done(); return; }
    if (apiLoading) {
      apiWaiters.push({ done: done, fail: fail });
      return;
    }
    apiLoading = true;
    apiWaiters.push({ done: done, fail: fail });

    var s = document.createElement('script');
    s.src = API_URL;
    s.async = true;
    s.onload = function () {
      apiLoading = false;
      if (typeof window.$ !== 'function') {
        if (typeof window.jQuery === 'function') window.$ = window.jQuery;
        else installMiniDollar();
      }

      var ok = typeof window.Dosbox === 'function' && typeof window.$ === 'function';
      var waiters = apiWaiters.slice();
      apiWaiters = [];
      waiters.forEach(function (w) {
        if (ok) {
          if (w.done) w.done();
        } else {
          if (w.fail) w.fail('js-dos loaded but required globals (Dosbox/$) are unavailable.');
        }
      });
    };
    s.onerror = function () {
      apiLoading = false;
      var waiters = apiWaiters.slice();
      apiWaiters = [];
      waiters.forEach(function (w) { if (w.fail) w.fail(); });
    };
    document.head.appendChild(s);
  }

  function safeErr(e) {
    if (!e) return 'Unknown error.';
    return String(e.message || e).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function openExistingIfAny() {
    if (!existingWin || !document.body.contains(existingWin)) return false;
    existingWin.classList.remove('wm-hidden');
    if (window.Site.focusWindow) window.Site.focusWindow(existingWin);
    return true;
  }

  function openDoom() {
    if (openExistingIfAny()) return;

    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-skull" style="margin-right:6px;color:var(--red)"></i>doom',
      980, 700, 'doom-window'
    );
    if (!r) return;

    existingWin = r.win;

    var hostId = 'doom-host-' + Date.now();
    r.body.innerHTML =
      '<div class="doom-shell">' +
        '<div class="doom-host-wrap"><div id="' + hostId + '" class="dosbox-default doom-host"></div></div>' +
        '<div class="doom-credit">Powered by js-dos and implementation by TheDoggyBrad: ' +
          '<a href="https://github.com/thedoggybrad/doom_on_js-dos" target="_blank" rel="noopener noreferrer">doom_on_js-dos</a>' +
        '</div>' +
      '</div>';

    var host = document.getElementById(hostId);
    if (!host) return;

    host.innerHTML = '<div class="doom-loading">Loading js-dos...</div>';

    var dosboxInstance = null;
    var audioMuted = null;
    var audioTick = null;
    var closeObserver = null;
    var stopped = false;
    var trackedAudioCtxs = [];

    var _OrigAC = window.AudioContext || window.webkitAudioContext;
    if (_OrigAC) {
      var _PatchedAC = function () {
        var ctx = new _OrigAC();
        trackedAudioCtxs.push(ctx);
        return ctx;
      };
      _PatchedAC.prototype = _OrigAC.prototype;
      window.AudioContext = _PatchedAC;
      if (window.webkitAudioContext) window.webkitAudioContext = _PatchedAC;
    }

    function stopEmulator() {
      if (dosboxInstance) {
        try { if (typeof dosboxInstance.mute === 'function') dosboxInstance.mute(true); } catch (e) {}
        try { if (typeof dosboxInstance.pause === 'function') dosboxInstance.pause(); } catch (e) {}
        try { if (typeof dosboxInstance.stop === 'function') dosboxInstance.stop(); } catch (e) {}
        try { if (typeof dosboxInstance.exit === 'function') dosboxInstance.exit(); } catch (e) {}
        try { if (typeof dosboxInstance.destroy === 'function') dosboxInstance.destroy(); } catch (e) {}
      }
      dosboxInstance = null;

      trackedAudioCtxs.forEach(function (ctx) {
        try { ctx.suspend(); } catch (e) {}
        try { ctx.close(); } catch (e) {}
      });
      trackedAudioCtxs = [];

      if (_OrigAC) {
        window.AudioContext = _OrigAC;
        if (window.webkitAudioContext) window.webkitAudioContext = _OrigAC;
      }

      document.querySelectorAll('audio, video').forEach(function (el) {
        try { el.muted = true; el.pause(); el.src = ''; el.load(); } catch (e) {}
      });
    }

    function hardStop(removeWindow) {
      if (stopped) return;
      stopped = true;

      teardownAudioSync();
      if (closeObserver) {
        closeObserver.disconnect();
        closeObserver = null;
      }

      stopEmulator();

      if (host) host.innerHTML = '';

      var active = document.activeElement;
      if (active && r.win.contains(active) && active.blur) {
        try { active.blur(); } catch (e) {}
      }
      document.body.focus();

      if (r.win.parentNode) {
        r.win.parentNode.removeChild(r.win);
      }

      if (existingWin === r.win) existingWin = null;
    }

    function applyMuteState(muted) {
      if (audioMuted === muted) return;
      audioMuted = muted;

      var media = host.querySelectorAll('audio, video');
      for (var i = 0; i < media.length; i++) {
        media[i].muted = muted;
      }

      if (dosboxInstance && typeof dosboxInstance.mute === 'function') {
        try { dosboxInstance.mute(muted); } catch (e) {}
      }
    }

    function syncMuteState() {
      if (!document.body.contains(r.win) || r.win.classList.contains('wm-hidden')) {
        hardStop(true);
        return;
      }
      var shouldMute = document.hidden || !r.win.classList.contains('focused');
      applyMuteState(shouldMute);
    }

    function teardownAudioSync() {
      document.removeEventListener('visibilitychange', syncMuteState);
      document.removeEventListener('focusin', syncMuteState, true);
      document.removeEventListener('mousedown', syncMuteState, true);
      window.removeEventListener('blur', syncMuteState);
      window.removeEventListener('focus', syncMuteState);
      if (audioTick) {
        clearInterval(audioTick);
        audioTick = null;
      }
    }

    document.addEventListener('visibilitychange', syncMuteState);
    document.addEventListener('focusin', syncMuteState, true);
    document.addEventListener('mousedown', syncMuteState, true);
    window.addEventListener('blur', syncMuteState);
    window.addEventListener('focus', syncMuteState);
    window.addEventListener('pagehide', function () { hardStop(false); });
    window.addEventListener('beforeunload', function () { hardStop(false); });
    audioTick = setInterval(syncMuteState, 250);

    var closeBtn = r.win.querySelector('.editor-close-btn');
    if (closeBtn) {
      var oldListeners = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(oldListeners, closeBtn);
      oldListeners.addEventListener('click', function (e) {
        e.stopPropagation();
        hardStop(true);
      });
    }

    closeObserver = new MutationObserver(function () {
      if (!document.body.contains(r.win) || r.win.classList.contains('wm-hidden')) {
        hardStop(true);
      }
    });
    closeObserver.observe(document.body, { childList: true, subtree: false });
    closeObserver.observe(r.win, { attributes: true, attributeFilter: ['class'] });

    ensureApi(function () {
      if (!document.body.contains(r.win) || !document.getElementById(hostId)) return;
      host.innerHTML = '';
      try {
        dosboxInstance = new window.Dosbox({
          id: hostId,
          onload: function (dosbox) {
            dosbox.run(ARCHIVE_URL, EXECUTABLE);
          },
          onrun: function () {}
        });
        syncMuteState();
      } catch (e) {
        host.innerHTML = '<div class="doom-loading">Unable to start DOOM: ' + safeErr(e) + '</div>';
      }
    }, function (msg) {
      host.innerHTML = '<div class="doom-loading">Failed to load js-dos API from upstream host. ' +
        (msg ? safeErr(msg) : '') + '</div>';
    });

    syncMuteState();
  }

  window.Site.openDoom = openDoom;

})();
