window.Site = window.Site || {};

(function () {

  function openMemory() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-brain" style="margin-right:6px;color:var(--mauve)"></i>memory',
      620, 620, 'memory-window'
    );
    if (!r) return;

    var running = true;
    var mode = null;
    var lock = false;
    var cards = [];
    var open = [];
    var matched = 0;
    var moves = 0;
    var startTime = 0;

    var MODES = {
      easy: { label: 'Easy 4x4', cols: 4, rows: 4 },
      medium: { label: 'Medium 5x4', cols: 5, rows: 4 },
      hard: { label: 'Hard 6x4', cols: 6, rows: 4 },
    };

    var SYMBOLS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--base);overflow:hidden;';

    var stats = document.createElement('div');
    stats.style.cssText = 'display:flex;gap:14px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--text);';
    stats.innerHTML = '<span id="mem-mode">Mode: -</span><span id="mem-moves">Moves: 0</span><span id="mem-time">Time: 0s</span>';
    r.body.appendChild(stats);

    var board = document.createElement('div');
    board.style.cssText = 'display:grid;gap:8px;justify-content:center;align-content:start;flex:1;';
    r.body.appendChild(board);

    var status = document.createElement('div');
    status.style.cssText = 'min-height:16px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--subtext0);';
    r.body.appendChild(status);

    function setStatus(msg, color) {
      status.textContent = msg || '';
      status.style.color = color || 'var(--subtext0)';
    }

    function shuffle(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
      }
      return arr;
    }

    function updateStats() {
      var modeEl = stats.querySelector('#mem-mode');
      var movesEl = stats.querySelector('#mem-moves');
      var timeEl = stats.querySelector('#mem-time');
      modeEl.textContent = 'Mode: ' + (mode ? MODES[mode].label : '-');
      movesEl.textContent = 'Moves: ' + moves;
      var t = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
      timeEl.textContent = 'Time: ' + t + 's';
    }

    function render() {
      board.innerHTML = '';
      if (!mode) return;

      var cfg = MODES[mode];
      board.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', 1fr)';

      cards.forEach(function (c, idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText =
          'height:66px;min-width:66px;border:none;border-radius:8px;cursor:pointer;' +
          'font-family:"JetBrains Mono",monospace;font-weight:700;font-size:22px;' +
          'background:' + (c.matched ? '#40a02b' : c.open ? 'var(--blue)' : 'var(--surface1)') + ';' +
          'color:' + (c.matched || c.open ? '#f9f6f2' : 'var(--subtext0)') + ';';
        btn.textContent = (c.open || c.matched) ? c.sym : '?';
        btn.addEventListener('click', function () {
          onCard(idx);
        });
        board.appendChild(btn);
      });
    }

    function showMenu() {
      mode = null;
      cards = [];
      open = [];
      matched = 0;
      moves = 0;
      startTime = 0;
      lock = false;
      updateStats();
      render();
      setStatus('Pick a mode to play.', 'var(--subtext0)');

      var menu = document.createElement('div');
      menu.style.cssText = 'position:absolute;inset:42px 12px 12px 12px;display:flex;align-items:center;justify-content:center;background:rgba(17,17,27,0.7);border-radius:8px;';
      var inner = document.createElement('div');
      inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:300px;';
      inner.innerHTML = '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:22px;font-weight:700;color:var(--text)">MEMORY</div><div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--subtext0)">Match all pairs in the fewest moves</div>';

      Object.keys(MODES).forEach(function (k) {
        var b = document.createElement('button');
        b.className = 'g2048-btn';
        b.textContent = MODES[k].label;
        b.addEventListener('click', function () {
          mode = k;
          var cfg = MODES[k];
          var pairCount = (cfg.cols * cfg.rows) / 2;
          var pool = SYMBOLS.slice(0, pairCount);
          var all = shuffle(pool.concat(pool));
          cards = all.map(function (s) { return { sym: s, open: false, matched: false }; });
          open = [];
          matched = 0;
          moves = 0;
          lock = false;
          startTime = Date.now();
          setStatus('', 'var(--subtext0)');
          updateStats();
          render();
          if (menu.parentNode) menu.parentNode.removeChild(menu);
        });
        inner.appendChild(b);
      });

      menu.appendChild(inner);
      r.body.appendChild(menu);
    }

    function onCard(i) {
      if (!running || !mode || lock) return;
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) return;
      var c = cards[i];
      if (!c || c.open || c.matched) return;

      c.open = true;
      open.push(i);
      render();

      if (open.length < 2) return;
      moves++;
      updateStats();
      var c1 = cards[open[0]];
      var c2 = cards[open[1]];

      if (c1.sym === c2.sym) {
        c1.matched = true;
        c2.matched = true;
        c1.open = false;
        c2.open = false;
        matched += 2;
        open = [];
        render();
        if (matched === cards.length) {
          var secs = Math.floor((Date.now() - startTime) / 1000);
          setStatus('Cleared in ' + moves + ' moves and ' + secs + 's. Press Enter for menu.', 'var(--green)');
        }
      } else {
        lock = true;
        setTimeout(function () {
          c1.open = false;
          c2.open = false;
          open = [];
          lock = false;
          render();
        }, 520);
      }
    }

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) return;
      if (e.key === 'Enter' && matched === cards.length && mode) {
        e.preventDefault();
        showMenu();
      }
    }
    document.addEventListener('keydown', onKey);

    function loop() {
      if (!running || !document.body.contains(r.win)) {
        running = false;
        return;
      }
      if (mode && matched !== cards.length) updateStats();
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

  window.Site.openMemory = openMemory;

})();
