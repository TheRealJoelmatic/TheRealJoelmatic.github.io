








window.Site = window.Site || {};

(function () {

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  

  function renderMdHtml(content) {
    function inlineFmt(s) {
      var t = esc(s);
      t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
      t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      t = t.replace(/(https?:\/\/[^\s<"&]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      return t;
    }
    var lines   = content.split('\n');
    var html    = '';
    var inTable = false;
    for (var i = 0; i < lines.length; i++) {
      var trim = lines[i].trim();
      var hm = trim.match(/^(#{1,3}) (.*)/);
      if (hm) {
        if (inTable) { html += '</tbody></table>'; inTable = false; }
        var lvl = hm[1].length;
        html += '<h' + lvl + '>' + inlineFmt(hm[2]) + '</h' + lvl + '>';
        continue;
      }
      if (/^\|.*\|$/.test(trim)) {
        if (!inTable) { html += '<table class="md-table"><tbody>'; inTable = true; }
        if (/^\|[-| :]+\|$/.test(trim)) { continue; } // separator row
        var cells = trim.split('|').slice(1, -1);
        html += '<tr>' + cells.map(function (c) {
          return '<td>' + inlineFmt(c.trim()) + '</td>';
        }).join('') + '</tr>';
        continue;
      }
      if (inTable) { html += '</tbody></table>'; inTable = false; }
      if (/^[-*] /.test(trim)) { html += '<li>' + inlineFmt(trim.slice(2)) + '</li>'; continue; }
      if (!trim) { html += '<br>'; continue; }
      html += '<p>' + inlineFmt(trim) + '</p>';
    }
    if (inTable) html += '</tbody></table>';
    return html;
  }


  function openEditor(filename, content) {
    var rawContent = content || '';

    if (window.innerWidth <= 780) {
      var overlay = document.createElement('div');
      overlay.className = 'rofi-overlay editor-mobile-overlay';

      var modal = document.createElement('div');
      modal.className = 'editor-mobile-modal';

      var hdr = document.createElement('div');
      hdr.className = 'editor-mobile-hdr';

      var htitle = document.createElement('span');
      htitle.innerHTML = '<i class="fa-regular fa-file-lines" style="margin-right:6px;opacity:0.7"></i>' + esc(filename);

      var hbtns = document.createElement('div');
      hbtns.style.cssText = 'display:flex;align-items:center;gap:8px;';

      var mPreviewBtn = document.createElement('button');
      mPreviewBtn.className = 'editor-preview-btn';
      mPreviewBtn.textContent = 'Source';

      var mCloseBtn = document.createElement('button');
      mCloseBtn.className = 'editor-close-btn';
      mCloseBtn.setAttribute('aria-label', 'Close');

      hbtns.appendChild(mPreviewBtn);
      hbtns.appendChild(mCloseBtn);
      hdr.appendChild(htitle);
      hdr.appendChild(hbtns);

      var body = document.createElement('div');
      body.className = 'editor-mobile-body';

      var previewPane = document.createElement('div');
      previewPane.className = 'editor-preview-pane';
      previewPane.innerHTML = renderMdHtml(rawContent);

      var editorPane = document.createElement('div');
      editorPane.className = 'editor-pane';
      editorPane.style.display = 'none';

      var gutter = document.createElement('div');
      gutter.className = 'editor-gutter';

      var textarea = document.createElement('textarea');
      textarea.className = 'editor-textarea';
      textarea.value = rawContent;
      textarea.setAttribute('spellcheck', 'false');
      textarea.setAttribute('autocomplete', 'off');
      textarea.setAttribute('autocorrect', 'off');
      editorPane.appendChild(gutter);
      editorPane.appendChild(textarea);

      body.appendChild(previewPane);
      body.appendChild(editorPane);
      modal.appendChild(hdr);
      modal.appendChild(body);
      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      function updateGutterM() {
        var n = rawContent.split('\n').length;
        var h = '';
        for (var i = 1; i <= n; i++) h += '<div class="editor-ln">' + i + '</div>';
        gutter.innerHTML = h;
        gutter.scrollTop = textarea.scrollTop;
      }
      updateGutterM();
      textarea.addEventListener('scroll', function () { gutter.scrollTop = textarea.scrollTop; });
      textarea.addEventListener('input', function () {
        rawContent = textarea.value;
        updateGutterM();
        if (window.Site.vfs) window.Site.vfs.write('/home/joel/' + filename, rawContent, [], false);
      });

      var isPreviewM = true;
      mPreviewBtn.addEventListener('click', function () {
        isPreviewM = !isPreviewM;
        if (isPreviewM) {
          previewPane.innerHTML = renderMdHtml(rawContent);
          previewPane.style.display = '';
          editorPane.style.display  = 'none';
          mPreviewBtn.textContent = 'Source';
        } else {
          previewPane.style.display  = 'none';
          editorPane.style.display   = '';
          mPreviewBtn.textContent = 'Markdown view';
          textarea.focus();
        }
      });

      function closeModal() {
        overlay.classList.remove('rofi-show');
        setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 180);
      }
      mCloseBtn.addEventListener('click', closeModal);
      overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeModal(); });
      setTimeout(function () { overlay.classList.add('rofi-show'); }, 10);
      return;
    }

    var desk = document.getElementById('desktop');
    if (!desk) return;

    var dRect     = desk.getBoundingClientRect();
    var edW       = Math.min(640, dRect.width  - 40);
    var edH       = Math.min(500, dRect.height - 40);
    var edL       = Math.round((dRect.width  - edW) / 2);
    var edT       = Math.round((dRect.height - edH) / 2);
    var isPreview = true;

    var win = document.createElement('div');
    win.className = 'window editor-window floating';
    win.style.left   = edL + 'px';
    win.style.top    = edT + 'px';
    win.style.width  = edW + 'px';
    win.style.height = edH + 'px';

    var tb = document.createElement('div');
    tb.className = 'window-titlebar editor-titlebar';

    var titleSpan = document.createElement('span');
    titleSpan.className = 'window-title-text';
    titleSpan.innerHTML = '<i class="fa-regular fa-file-lines" style="margin-right:6px;opacity:0.6"></i>kate \u2014 ' + esc(filename);

    var tbRight = document.createElement('div');
    tbRight.style.cssText = 'display:flex;align-items:center;gap:8px;';

    var previewBtn = document.createElement('button');
    previewBtn.className = 'editor-preview-btn';
    previewBtn.textContent = 'Source';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'editor-close-btn';
    closeBtn.setAttribute('aria-label', 'Close');

    tbRight.appendChild(previewBtn);
    tbRight.appendChild(closeBtn);
    tb.appendChild(titleSpan);
    tb.appendChild(tbRight);
    win.appendChild(tb);

    var contentEl = document.createElement('div');
    contentEl.className = 'window-content editor-content';

    var editorPane = document.createElement('div');
    editorPane.className = 'editor-pane';

    var gutter = document.createElement('div');
    gutter.className = 'editor-gutter';

    var textarea = document.createElement('textarea');
    textarea.className = 'editor-textarea';
    textarea.value = rawContent;
    textarea.setAttribute('spellcheck', 'false');
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocorrect', 'off');

    editorPane.appendChild(gutter);
    editorPane.appendChild(textarea);

    var previewPane = document.createElement('div');
    previewPane.className = 'editor-preview-pane';

    contentEl.appendChild(editorPane);
    contentEl.appendChild(previewPane);
    win.appendChild(contentEl);
    desk.appendChild(win);

    function updateGutter() {
      var n    = rawContent.split('\n').length;
      var html = '';
      for (var i = 1; i <= n; i++) html += '<div class="editor-ln">' + i + '</div>';
      gutter.innerHTML = html;
      gutter.scrollTop = textarea.scrollTop;
    }
    updateGutter();

    textarea.addEventListener('scroll', function () { gutter.scrollTop = textarea.scrollTop; });
    textarea.addEventListener('input', function () {
      rawContent = textarea.value;
      updateGutter();
      if (window.Site.vfs) window.Site.vfs.write('/home/joel/' + filename, rawContent, [], false);
    });

    previewBtn.addEventListener('click', function () {
      isPreview = !isPreview;
      if (isPreview) {
        previewPane.innerHTML = renderMdHtml(rawContent);
        previewPane.style.display = '';
        editorPane.style.display  = 'none';
        previewBtn.textContent = 'Source';
      } else {
        previewPane.style.display  = 'none';
        editorPane.style.display   = '';
        previewBtn.textContent = 'Markdown view';
        textarea.focus();
      }
    });

    closeBtn.addEventListener('click', function () {
      if (window.Site.closeWindow) window.Site.closeWindow(win);
      else if (win.parentNode) win.parentNode.removeChild(win);
    });

    editorPane.style.display = 'none';
    previewPane.innerHTML = renderMdHtml(rawContent);

    if (window.Site.focusWindow) window.Site.focusWindow(win);
  }

  window.Site.renderMdHtml = renderMdHtml;
  window.Site.openEditor   = openEditor;

})();
