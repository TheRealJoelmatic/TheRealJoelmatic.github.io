







window.Site = window.Site || {};

(function () {

  function openNemo() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-folder-open" style="margin-right:6px;color:var(--yellow)"></i>nemo \u2014 /home/joel',
      580, 400, 'nemo-window'
    );
    if (!r) return;

    var esc = window.Site.esc;
    var vfs = window.Site.vfs;
    var cwd = ['home', 'joel'];

    function pathStr() { return '/' + cwd.join('/'); }

    function render() {
      var entries = vfs ? vfs.ls('.', cwd) : [];
      var up = cwd.length > 0;
      r.body.innerHTML =
        '<div class="nemo-path"><i class="fa-solid fa-folder" style="margin-right:6px"></i>' + esc(pathStr()) + '</div>' +
        '<div class="nemo-grid">' +
        (up ? '<div class="nemo-item nemo-dir" data-action="up"><i class="fa-solid fa-arrow-up"></i><span>..</span></div>' : '') +
        (entries || []).map(function (e) {
          var isDir = e.node.type === 'dir';
          var icon  = isDir ? 'fa-solid fa-folder' : (e.name.endsWith('.md') ? 'fa-regular fa-file-lines' : 'fa-regular fa-file');
          var col   = isDir ? 'color:var(--yellow)' : (e.name.endsWith('.md') ? 'color:var(--blue)' : '');
          return '<div class="nemo-item ' + (isDir ? 'nemo-dir' : 'nemo-file') +
                 '" data-name="' + esc(e.name) + '" data-dir="' + isDir + '">' +
                 '<i class="' + icon + '" style="' + col + '"></i>' +
                 '<span>' + esc(e.name) + '</span></div>';
        }).join('') +
        '</div>';

      r.body.querySelectorAll('.nemo-item').forEach(function (el) {
        el.addEventListener('click', function () {
          if (el.dataset.action === 'up') {
            if (cwd.length) cwd.pop();
            render();
            return;
          }
          var name = el.dataset.name;
          if (el.dataset.dir === 'true') {
            cwd.push(name);
            render();
          } else {
            var content = vfs ? vfs.cat(name, cwd) : '';
            if (window.Site.openEditor) window.Site.openEditor(name, content || '');
          }
        });
      });
    }

    render();
  }

  window.Site.openNemo = openNemo;

})();
