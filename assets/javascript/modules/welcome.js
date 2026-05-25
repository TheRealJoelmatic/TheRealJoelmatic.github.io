





window.Site = window.Site || {};

(function () {

  var STORAGE_KEY = 'joelmatic_welcomed_v1';

  var SECTIONS = [
    {
      icon: 'fa-brands fa-linux',
      title: 'Welcome to @TheRealJoelmatic\'s portfolio',
      body:
        '<p>This site is inspired by the <strong>Hyprland</strong> workflow.</p>' +
        '<p>Click any window to focus it. Drag titlebars to move floating windows. Double click a titlebar to maximise.</p>',
    },
    {
      icon: 'fa-solid fa-keyboard',
      title: 'Keyboard shortcuts',
      body:
        '<div class="wlc-keytable">' +
          '<div class="wlc-row"><kbd>Shift</kbd>+<kbd>R</kbd><span>Open app launcher (rofi)</span></div>' +
          '<div class="wlc-row"><kbd>Shift</kbd>+<kbd>Q</kbd><span>Close focused window</span></div>' +
          '<div class="wlc-row"><kbd>Shift</kbd>+<kbd>F</kbd><span>Toggle fullscreen</span></div>' +
          '<div class="wlc-row"><kbd>Shift</kbd>+<kbd>J/K</kbd><span>Cycle window focus</span></div>' +
          '<div class="wlc-row"><kbd>Shift</kbd>+<kbd>↑↓←→</kbd><span>Snap + tile windows</span></div>' +
          '<div class="wlc-row"><kbd>Shift</kbd>+<kbd>?</kbd><span>Re-open this guide</span></div>' +
        '</div>',
    },
    {
      icon: 'fa-solid fa-window-restore',
      title: 'Drag-to-snap',
      body:
        '<p>Drag any floating window to a <strong>screen edge</strong> to snap it:</p>' +
        '<div class="wlc-snapgrid">' +
          '<div class="wlc-snapcell corner">↖ quarter</div>' +
          '<div class="wlc-snapcell top">↑ maximise</div>' +
          '<div class="wlc-snapcell corner">↗ quarter</div>' +
          '<div class="wlc-snapcell side">← left half</div>' +
          '<div class="wlc-snapcell mid"></div>' +
          '<div class="wlc-snapcell side">right half →</div>' +
          '<div class="wlc-snapcell corner">↙ quarter</div>' +
          '<div class="wlc-snapcell bot"></div>' +
          '<div class="wlc-snapcell corner">↘ quarter</div>' +
        '</div>',
    },
    {
      icon: 'fa-solid fa-terminal',
      title: 'Terminal & filesystem',
      body:
        '<p>The terminal on the left is fully interactive, type commands like a real shell:</p>' +
        '<div class="wlc-keytable">' +
          '<div class="wlc-row"><code>fastfetch</code><span>Display about info</span></div>' +
          '<div class="wlc-row"><code>ls / cat &lt;file&gt;</code><span>Browse the virtual filesystem</span></div>' +
          '<div class="wlc-row"><code>kate &lt;file&gt;</code><span>Open a file in the editor</span></div>' +
          '<div class="wlc-row"><code>pipes.sh</code><span>Animated pipes screensaver</span></div>' +
          '<div class="wlc-row"><code>help</code><span>Full command reference</span></div>' +
        '</div>',
    },
    {
      icon: 'fa-brands fa-linux',
      title: 'Apps, games, and launcher',
      body:
        '<p>There are <strong>loads of apps and games</strong> to explore in this desktop.</p>' +
        '<p>Open the app launcher (rofi) any time with <kbd>Shift</kbd>+<kbd>R</kbd> or by pressing the <strong>penguin button</strong> in the top-left waybar.</p>' +
        '<p>Type to search, then click an app to launch it.</p>',
    },
  ];

  var overlay, inner, pageEls, dotEls, curPage;

  function buildDOM() {
    overlay = document.createElement('div');
    overlay.id = 'wlc-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Welcome guide');

    inner = document.createElement('div');
    inner.id = 'wlc-inner';

    
    var hdr = document.createElement('div');
    hdr.id = 'wlc-header';
    hdr.innerHTML =
      '<span id="wlc-header-title">ghostty — welcome</span>' +
      '<button id="wlc-close" aria-label="Close"></button>';
    inner.appendChild(hdr);

    
    var pages = document.createElement('div');
    pages.id = 'wlc-pages';
    pageEls = [];
    SECTIONS.forEach(function (s, i) {
      var pg = document.createElement('div');
      pg.className = 'wlc-page' + (i === 0 ? ' wlc-active' : '');
      pg.innerHTML =
        '<div class="wlc-page-icon"><i class="' + s.icon + '"></i></div>' +
        '<h2 class="wlc-page-title">' + s.title + '</h2>' +
        '<div class="wlc-page-body">' + s.body + '</div>';
      pages.appendChild(pg);
      pageEls.push(pg);
    });
    inner.appendChild(pages);

    
    var foot = document.createElement('div');
    foot.id = 'wlc-footer';
    var dots = document.createElement('div');
    dots.id = 'wlc-dots';
    dotEls = [];
    SECTIONS.forEach(function (_, i) {
      var d = document.createElement('button');
      d.className = 'wlc-dot-btn' + (i === 0 ? ' wlc-dot-active' : '');
      d.setAttribute('aria-label', 'Page ' + (i + 1));
      (function (idx) { d.addEventListener('click', function () { goTo(idx); }); })(i);
      dots.appendChild(d);
      dotEls.push(d);
    });
    var btnPrev = document.createElement('button');
    btnPrev.id = 'wlc-prev';
    btnPrev.textContent = '← Prev';
    btnPrev.addEventListener('click', function () { goTo(curPage - 1); });

    var btnNext = document.createElement('button');
    btnNext.id = 'wlc-next';
    btnNext.textContent = 'Next →';
    btnNext.addEventListener('click', function () {
      if (curPage < SECTIONS.length - 1) { goTo(curPage + 1); }
      else { close(); }
    });

    foot.appendChild(btnPrev);
    foot.appendChild(dots);
    foot.appendChild(btnNext);
    inner.appendChild(foot);

    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    document.getElementById('wlc-close').addEventListener('click', close);
    

    document.addEventListener('keydown', onKey);
    curPage = 0;
    updateNav();
  }

  function goTo(idx) {
    if (idx < 0 || idx >= SECTIONS.length) return;
    pageEls[curPage].classList.remove('wlc-active');
    dotEls[curPage].classList.remove('wlc-dot-active');
    curPage = idx;
    pageEls[curPage].classList.add('wlc-active');
    dotEls[curPage].classList.add('wlc-dot-active');
    updateNav();
  }

  function updateNav() {
    var prev = document.getElementById('wlc-prev');
    var next = document.getElementById('wlc-next');
    if (prev) prev.style.visibility = curPage === 0 ? 'hidden' : 'visible';
    if (next) next.textContent = curPage === SECTIONS.length - 1 ? 'Got it ✓' : 'Next →';
  }

  function onKey(e) {
    if (!overlay || overlay.style.display === 'none') return;
    if (e.key === 'Escape')      { close(); }
    if (e.key === 'ArrowRight')  { goTo(curPage + 1); }
    if (e.key === 'ArrowLeft')   { goTo(curPage - 1); }
  }

  function open() {
    if (!overlay) buildDOM();
    overlay.style.display = 'flex';
    requestAnimationFrame(function () { overlay.classList.add('wlc-show'); });
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('wlc-show');
    setTimeout(function () {
      if (overlay) overlay.style.display = 'none';
    }, 200);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  }

  
  document.addEventListener('keydown', function (e) {
    if (e.shiftKey && (e.key === '?' || e.key === '/')) {
      goTo(0);
      open();
    }
  });

  window.Site.openWelcome = open;

  
  (function () {
    var seen = false;
    try { seen = !!localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!seen) {
      
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(open, 200);
      });
    }
  }());

}());
