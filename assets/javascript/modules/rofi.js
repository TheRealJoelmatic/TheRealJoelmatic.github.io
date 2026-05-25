












window.Site = window.Site || {};

(function () {

  var APPS = [
    { label: 'ghostty',     icon: 'fa-solid fa-terminal',     winId: 'terminal-fastfetch', action: null       },
    { label: 'chromium',    icon: 'fa-brands fa-chrome',      winId: 'widget-links',       action: null       },
    { label: 'pipes.sh',    icon: 'fa-solid fa-wave-square',  winId: 'widget-pipes',       action: null       },
    { label: 'htop',        icon: 'fa-solid fa-microchip',    winId: null,                 action: 'htop'     },
    { label: 'cava',        icon: 'fa-solid fa-music',        winId: null,                 action: 'cava'     },
    { label: 'nemo',        icon: 'fa-solid fa-folder-open',  winId: null,                 action: 'nemo'     },
    { label: 'nyancat',     icon: 'fa-solid fa-cat',                       winId: null, action: 'nyancat'     },
    { label: '2048',        icon: 'fa-solid fa-grip',                       winId: null, action: '2048'        },
    { label: 'snake',       icon: 'fa-solid fa-worm',                       winId: null, action: 'snake'       },
    { label: 'minesweeper', icon: 'fa-solid fa-bomb',                       winId: null, action: 'minesweeper' },
    { label: 'pong',        icon: 'fa-solid fa-table-tennis-paddle-ball',   winId: null, action: 'pong'        },
    { label: 'breakout',    icon: 'fa-solid fa-bars-staggered',             winId: null, action: 'breakout'    },
    { label: 'doom',        icon: 'fa-solid fa-skull',                      winId: null, action: 'doom'        },
    { label: 'help.md',     icon: 'fa-regular fa-file-lines', winId: null,                 action: 'help'     },
    { label: 'thanks.md',   icon: 'fa-regular fa-file-lines', winId: null,                 action: 'thanks'   },
    { label: 'keybinds.md', icon: 'fa-regular fa-file-lines', winId: null,                 action: 'keybinds' },
    { label: 'README.md',   icon: 'fa-regular fa-file-lines', winId: null,                 action: 'readme'   },
    { label: 'welcome',     icon: 'fa-solid fa-circle-question', winId: null,               action: 'welcome'  },
  ];

  window.Site.openRofi = function () {
    var esc = window.Site.esc || function (s) { return String(s); };
    var vfs = window.Site.vfs;

    var existing = document.querySelector('.rofi-overlay');
    if (existing) {
      existing.classList.add('rofi-show');
      var existingInput = existing.querySelector('.rofi-input');
      if (existingInput) existingInput.focus();
      return;
    }

    var overlay = document.createElement('div');
    overlay.className = 'rofi-overlay';

    var inner = document.createElement('div');
    inner.className = 'rofi-inner';

    var searchWrap = document.createElement('div');
    searchWrap.className = 'rofi-search-wrap';
    searchWrap.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    var input = document.createElement('input');
    input.className = 'rofi-input';
    input.placeholder = 'Search applications...';
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    searchWrap.appendChild(input);

    var appsEl = document.createElement('div');
    appsEl.className = 'rofi-apps';

    function renderApps(filter) {
      appsEl.innerHTML = '';
      var filtered = APPS.filter(function (a) {
        return !filter || a.label.indexOf(filter.toLowerCase()) !== -1;
      });
      if (!filtered.length) {
        appsEl.innerHTML = '<div class="rofi-empty">No results for "' + esc(filter) + '"</div>';
        return;
      }
      filtered.forEach(function (app) {
        var el = document.createElement('div');
        el.className = 'rofi-app';
        el.innerHTML = '<i class="' + app.icon + '"></i><span>' + esc(app.label) + '</span>';
        el.addEventListener('click', function () {
          close();
          vfs = window.Site.vfs;
          if (app.action === 'help') {
            window.Site.openEditor('help.md',     vfs ? vfs.cat('/home/joel/help.md',     []) : '');
            return;
          }
          if (app.action === 'thanks') {
            window.Site.openEditor('thanks.md',   vfs ? vfs.cat('/home/joel/thanks.md',   []) : '');
            return;
          }
          if (app.action === 'keybinds') {
            window.Site.openEditor('keybinds.md', vfs ? vfs.cat('/home/joel/keybinds.md', []) : '');
            return;
          }
          if (app.action === 'readme') {
            window.Site.openEditor('README.md',   vfs ? vfs.cat('/home/joel/README.md',   []) : '');
            return;
          }
          if (app.action === 'htop')    { window.Site.openHtop();    return; }
          if (app.action === 'cava')    { window.Site.openCava();    return; }
          if (app.action === 'nemo')    { window.Site.openNemo();    return; }
          if (app.action === 'nyancat')     { window.Site.openNyanCat();    return; }
          if (app.action === '2048')        { window.Site.open2048();       return; }
          if (app.action === 'snake')       { window.Site.openSnake();      return; }
          if (app.action === 'minesweeper') { window.Site.openMinesweeper(); return; }
          if (app.action === 'pong')        { window.Site.openPong();       return; }
          if (app.action === 'breakout')    { window.Site.openBreakout();   return; }
          if (app.action === 'doom')        { window.Site.openDoom();       return; }
          if (app.action === 'welcome')      { if (window.Site.openWelcome) window.Site.openWelcome(); return; }
          if (app.winId) {
            if (window.Site.openWindow) {
              window.Site.openWindow(app.winId);
            } else {
              var win = document.getElementById(app.winId);
              if (win && window.Site.focusWindow) window.Site.focusWindow(win);
            }
          }
        });
        appsEl.appendChild(el);
      });
    }

    function close() {
      overlay.classList.remove('rofi-show');
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 180);
    }

    function onKey(e) { if (e.key === 'Escape') close(); }

    renderApps('');
    input.addEventListener('input', function () { renderApps(input.value); });

    inner.appendChild(searchWrap);
    inner.appendChild(appsEl);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);
    setTimeout(function () { overlay.classList.add('rofi-show'); input.focus(); }, 10);
  };

})();
