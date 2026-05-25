




window.Site = window.Site || {};

(function () {

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function makeFloatWin(titleHtml, w, h, extraClass) {
    var desk = document.getElementById('desktop');
    if (!desk) return null;
    var dRect = desk.getBoundingClientRect();
    var winW  = Math.min(w, dRect.width  - 40);
    var winH  = Math.min(h, dRect.height - 40);

    var win = document.createElement('div');
    win.className = 'window floating app-window ' + (extraClass || '');
    win.style.left   = Math.round((dRect.width  - winW) / 2) + 'px';
    win.style.top    = Math.round((dRect.height - winH) / 2) + 'px';
    win.style.width  = winW + 'px';
    win.style.height = winH + 'px';

    var tb = document.createElement('div');
    tb.className = 'window-titlebar';
    tb.style.cssText = 'justify-content:space-between;padding:0 8px 0 14px;';

    var ttl = document.createElement('span');
    ttl.className = 'window-title-text';
    ttl.innerHTML = titleHtml;

    var cls = document.createElement('button');
    cls.className = 'editor-close-btn';
    cls.setAttribute('aria-label', 'Close');

    tb.appendChild(ttl);
    tb.appendChild(cls);
    win.appendChild(tb);

    var body = document.createElement('div');
    body.className = 'window-content';
    win.appendChild(body);

    desk.appendChild(win);

    cls.addEventListener('click', function () {
      if (window.Site.closeWindow) window.Site.closeWindow(win);
      else if (win.parentNode) win.parentNode.removeChild(win);
    });

    if (window.Site.focusWindow) window.Site.focusWindow(win);
    return { win: win, body: body };
  }

  window.Site.esc         = esc;
  window.Site.makeFloatWin = makeFloatWin;

})();
