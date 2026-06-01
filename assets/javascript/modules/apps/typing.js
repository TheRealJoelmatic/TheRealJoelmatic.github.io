window.Site = window.Site || {};

(function () {

  function openTyping() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-keyboard" style="margin-right:6px;color:var(--green)"></i>typing',
      760, 520, 'typing-window'
    );
    if (!r) return;

    var WORDS = [
      'kernel','buffer','signal','thread','socket','binary','system','secure','vector','packet',
      'cursor','render','window','process','python','golang','module','script','deploy','memory',
      'compile','runtime','dynamic','virtual','object','search','prompt','widget','layout','engine',
      'crypto','network','device','stream','latency','design','server','client','switch','monitor'
    ];

    var running = true;
    var mode = null;
    var started = false;
    var finished = false;

    var queue = [];
    var input = '';
    var typedChars = 0;
    var mistakes = 0;
    var totalWords = 0;
    var elapsedMs = 0;
    var durationMs = 0;

    var MODES = {
      sprint30: { label: 'Sprint 30s', duration: 30000, zen: false },
      marathon60: { label: 'Marathon 60s', duration: 60000, zen: false },
      zen: { label: 'Zen', duration: 0, zen: true },
    };

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--base);overflow:hidden;';

    var stats = document.createElement('div');
    stats.style.cssText = 'display:flex;gap:16px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--text);';
    stats.innerHTML = '<span id="tp-mode">Mode: -</span><span id="tp-time">Time: -</span><span id="tp-wpm">WPM: 0</span><span id="tp-acc">ACC: 100%</span>';
    r.body.appendChild(stats);

    var prompt = document.createElement('div');
    prompt.style.cssText = 'min-height:84px;padding:10px;border-radius:8px;background:var(--mantle);font-family:"JetBrains Mono",monospace;font-size:22px;line-height:1.6;color:var(--subtext1);word-break:break-word;';
    r.body.appendChild(prompt);

    var inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'display:flex;gap:8px;';
    var inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.placeholder = 'type here';
    inputEl.style.cssText = 'flex:1;border:none;outline:none;border-radius:8px;padding:11px 12px;background:var(--surface0);color:var(--text);font-family:"JetBrains Mono",monospace;font-size:16px;';
    inputWrap.appendChild(inputEl);
    r.body.appendChild(inputWrap);

    var status = document.createElement('div');
    status.style.cssText = 'min-height:16px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--subtext0);';
    r.body.appendChild(status);

    function pickWord() {
      return WORDS[Math.floor(Math.random() * WORDS.length)];
    }

    function refillQueue() {
      while (queue.length < 8) queue.push(pickWord());
    }

    function setStatus(msg, color) {
      status.textContent = msg || '';
      status.style.color = color || 'var(--subtext0)';
    }

    function renderPrompt() {
      refillQueue();
      var words = queue.slice(0, 6);
      var html = words.map(function (w, i) {
        if (i === 0) {
          return '<span style="color:var(--text);font-weight:700">' + w + '</span>';
        }
        return '<span>' + w + '</span>';
      }).join('<span style="opacity:.4"> </span>');
      prompt.innerHTML = html;
    }

    function updateStats() {
      var modeEl = stats.querySelector('#tp-mode');
      var timeEl = stats.querySelector('#tp-time');
      var wpmEl = stats.querySelector('#tp-wpm');
      var accEl = stats.querySelector('#tp-acc');

      modeEl.textContent = 'Mode: ' + (mode ? MODES[mode].label : '-');

      if (!mode) {
        timeEl.textContent = 'Time: -';
      } else if (MODES[mode].zen) {
        timeEl.textContent = 'Time: zen';
      } else {
        var left = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
        timeEl.textContent = 'Time: ' + left + 's';
      }

      var mins = Math.max(1 / 60, elapsedMs / 60000);
      var wpm = Math.round((typedChars / 5) / mins);
      var acc = typedChars ? Math.max(0, Math.round(((typedChars - mistakes) / typedChars) * 100)) : 100;
      wpmEl.textContent = 'WPM: ' + wpm;
      accEl.textContent = 'ACC: ' + acc + '%';
    }

    function showMenu() {
      mode = null;
      started = false;
      finished = false;
      queue = [];
      input = '';
      typedChars = 0;
      mistakes = 0;
      totalWords = 0;
      elapsedMs = 0;
      durationMs = 0;
      inputEl.value = '';
      prompt.innerHTML = '';
      setStatus('Pick a mode to start.', 'var(--subtext0)');
      updateStats();

      var menu = document.createElement('div');
      menu.style.cssText = 'position:absolute;inset:42px 12px 12px 12px;display:flex;align-items:center;justify-content:center;background:rgba(17,17,27,0.7);border-radius:8px;';
      var inner = document.createElement('div');
      inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:290px;';
      inner.innerHTML = '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:22px;font-weight:700;color:var(--text)">TYPING</div><div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--subtext0)">Type the highlighted word, then press Space</div>';

      Object.keys(MODES).forEach(function (k) {
        var b = document.createElement('button');
        b.className = 'g2048-btn';
        b.textContent = MODES[k].label;
        b.addEventListener('click', function () {
          mode = k;
          started = true;
          finished = false;
          queue = [];
          input = '';
          typedChars = 0;
          mistakes = 0;
          totalWords = 0;
          elapsedMs = 0;
          durationMs = MODES[k].duration;
          inputEl.value = '';
          setStatus('', 'var(--subtext0)');
          renderPrompt();
          updateStats();
          if (menu.parentNode) menu.parentNode.removeChild(menu);
          inputEl.focus();
        });
        inner.appendChild(b);
      });

      menu.appendChild(inner);
      r.body.appendChild(menu);
    }

    function completeWord() {
      if (!started || finished || !queue.length) return;
      var target = queue[0];
      var typed = input.trim().toLowerCase();
      var ok = typed === target;

      typedChars += target.length + 1;
      if (!ok) {
        var m = 0;
        var max = Math.max(target.length, typed.length);
        for (var i = 0; i < max; i++) {
          if ((target[i] || '') !== (typed[i] || '')) m++;
        }
        mistakes += m;
        setStatus('Miss: expected ' + target, 'var(--peach)');
      } else {
        totalWords++;
        setStatus('Nice', 'var(--green)');
      }

      queue.shift();
      input = '';
      inputEl.value = '';
      renderPrompt();
      updateStats();
    }

    function finishRun() {
      finished = true;
      started = false;
      var mins = Math.max(1 / 60, elapsedMs / 60000);
      var wpm = Math.round((typedChars / 5) / mins);
      var acc = typedChars ? Math.max(0, Math.round(((typedChars - mistakes) / typedChars) * 100)) : 100;
      setStatus('Done. ' + wpm + ' WPM, ' + acc + '% ACC. Press Enter for menu.', 'var(--blue)');
    }

    inputEl.addEventListener('keydown', function (e) {
      if (!running) return;
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) return;

      if (finished && e.key === 'Enter') {
        e.preventDefault();
        showMenu();
        return;
      }

      if (!started) return;

      if (e.key === ' ') {
        e.preventDefault();
        input = inputEl.value;
        completeWord();
      }
    });

    inputEl.addEventListener('input', function () {
      input = inputEl.value;
    });

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) return;
      if (e.key === 'Enter' && finished) {
        e.preventDefault();
        showMenu();
      }
    }
    document.addEventListener('keydown', onKey);

    function loop(ts) {
      if (!running || !document.body.contains(r.win)) {
        running = false;
        return;
      }
      if (!loop._last) loop._last = ts;
      var dt = ts - loop._last;
      loop._last = ts;

      if (started && !finished) {
        elapsedMs += dt;
        if (!MODES[mode].zen && elapsedMs >= durationMs) {
          elapsedMs = durationMs;
          updateStats();
          finishRun();
        } else {
          updateStats();
        }
      }

      requestAnimationFrame(loop);
    }

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', onKey);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    showMenu();
    requestAnimationFrame(loop);
  }

  window.Site.openTyping = openTyping;

})();
