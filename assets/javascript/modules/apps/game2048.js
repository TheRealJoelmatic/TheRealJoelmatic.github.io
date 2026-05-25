





window.Site = window.Site || {};

(function () {

  function open2048() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-grip" style="margin-right:6px;color:var(--peach)"></i>2048',
      420, 520, 'game2048-window'
    );
    if (!r) return;

    var SIZE = 4;
    var board = [];
    var score = 0;
    var best  = 0;
    var over  = false;
    var won   = false;

    var TILE_COLORS = {
      0:    ['#3d3f4f', '#6c7086'],
      2:    ['#eee4da', '#776e65'],
      4:    ['#ede0c8', '#776e65'],
      8:    ['#f2b179', '#f9f6f2'],
      16:   ['#f59563', '#f9f6f2'],
      32:   ['#f67c5f', '#f9f6f2'],
      64:   ['#f65e3b', '#f9f6f2'],
      128:  ['#edcf72', '#f9f6f2'],
      256:  ['#edcc61', '#f9f6f2'],
      512:  ['#edc850', '#f9f6f2'],
      1024: ['#edc53f', '#f9f6f2'],
      2048: ['#edc22e', '#f9f6f2'],
    };

    function initBoard() {
      board = [];
      for (var i = 0; i < SIZE; i++) {
        board.push([0, 0, 0, 0]);
      }
      score = 0;
      over  = false;
      won   = false;
      addRandom();
      addRandom();
    }

    function addRandom() {
      var empty = [];
      for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
          if (board[r][c] === 0) empty.push([r, c]);
        }
      }
      if (!empty.length) return;
      var pos = empty[Math.floor(Math.random() * empty.length)];
      board[pos[0]][pos[1]] = Math.random() < 0.9 ? 2 : 4;
    }

    function slide(row) {
      var arr = row.filter(function (v) { return v !== 0; });
      var merged = [];
      var gained = 0;
      for (var i = 0; i < arr.length; i++) {
        if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
          merged.push(arr[i] * 2);
          gained += arr[i] * 2;
          i++;
        } else {
          merged.push(arr[i]);
        }
      }
      while (merged.length < SIZE) merged.push(0);
      return { row: merged, gained: gained };
    }

    function move(dir) {
      if (over) return;
      var moved = false;
      var gained = 0;

      function applySlide(getRow, setRow) {
        for (var i = 0; i < SIZE; i++) {
          var old = getRow(i);
          var res = slide(old);
          gained += res.gained;
          var changed = old.some(function (v, j) { return v !== res.row[j]; });
          if (changed) { moved = true; setRow(i, res.row); }
        }
      }

      if (dir === 'left') {
        applySlide(
          function (r) { return board[r].slice(); },
          function (r, row) { board[r] = row; }
        );
      } else if (dir === 'right') {
        applySlide(
          function (r) { return board[r].slice().reverse(); },
          function (r, row) { board[r] = row.reverse(); }
        );
      } else if (dir === 'up') {
        applySlide(
          function (c) { return board.map(function (row) { return row[c]; }); },
          function (c, col) { col.forEach(function (v, r) { board[r][c] = v; }); }
        );
      } else if (dir === 'down') {
        applySlide(
          function (c) { return board.map(function (row) { return row[c]; }).reverse(); },
          function (c, col) { col.reverse().forEach(function (v, r) { board[r][c] = v; }); }
        );
      }

      if (moved) {
        score += gained;
        if (score > best) best = score;
        addRandom();
        if (!won) {
          for (var ri = 0; ri < SIZE; ri++) {
            for (var ci = 0; ci < SIZE; ci++) {
              if (board[ri][ci] === 2048) won = true;
            }
          }
        }
        over = !canMove();
        render();
      }
    }

    function canMove() {
      for (var r = 0; r < SIZE; r++) {
        for (var c = 0; c < SIZE; c++) {
          if (board[r][c] === 0) return true;
          if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
          if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
        }
      }
      return false;
    }

    function render() {
      scoreEl.textContent = score;
      bestEl.textContent  = best;
      gridEl.innerHTML = '';
      for (var ri = 0; ri < SIZE; ri++) {
        for (var ci = 0; ci < SIZE; ci++) {
          var val = board[ri][ci];
          var cell = document.createElement('div');
          cell.className = 'g2048-tile';
          var colors = TILE_COLORS[val] || ['#cdc1b4', '#f9f6f2'];
          cell.style.background = colors[0];
          cell.style.color      = colors[1];
          cell.style.fontSize   = val >= 1024 ? '20px' : val >= 128 ? '24px' : '28px';
          if (val) cell.textContent = val;
          gridEl.appendChild(cell);
        }
      }
      if (over || won) {
        var msg = document.createElement('div');
        msg.className = 'g2048-over';
        msg.innerHTML = (won ? '<span style="color:var(--yellow)">You win! 🎉</span>' : '<span style="color:var(--red)">Game over</span>') +
          '<br><button class="g2048-btn">New game</button>';
        msg.querySelector('button').addEventListener('click', function () {
          initBoard(); render();
        });
        gridEl.appendChild(msg);
      }
    }

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:16px;display:flex;flex-direction:column;align-items:center;gap:12px;background:var(--base);overflow:hidden;';

    var header = document.createElement('div');
    header.className = 'g2048-header';
    header.innerHTML =
      '<span class="g2048-title">2048</span>' +
      '<div class="g2048-scores">' +
        '<div class="g2048-score-box">SCORE<br><span id="g2048-score">0</span></div>' +
        '<div class="g2048-score-box">BEST<br><span id="g2048-best">0</span></div>' +
      '</div>';
    r.body.appendChild(header);

    var newBtn = document.createElement('button');
    newBtn.className = 'g2048-btn';
    newBtn.textContent = 'New game';
    newBtn.addEventListener('click', function () { initBoard(); render(); });
    r.body.appendChild(newBtn);

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;color:var(--subtext0);font-family:"JetBrains Mono",monospace;';
    hint.textContent = 'Arrow keys or WASD to move';
    r.body.appendChild(hint);

    var gridEl = document.createElement('div');
    gridEl.className = 'g2048-grid';
    r.body.appendChild(gridEl);

    var scoreEl = r.win.querySelector('#g2048-score');
    var bestEl  = r.win.querySelector('#g2048-best');
    
    scoreEl = null; bestEl = null;

    
    function resolveEls() {
      scoreEl = r.body.querySelector('#g2048-score');
      bestEl  = r.body.querySelector('#g2048-best');
    }
    resolveEls();

    var KEY_MAP = {
      ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
      a: 'left', d: 'right', w: 'up', s: 'down',
      A: 'left', D: 'right', W: 'up', S: 'down',
    };

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        return;
      }
      var dir = KEY_MAP[e.key];
      if (dir) { e.preventDefault(); move(dir); }
    }
    document.addEventListener('keydown', onKey);

    
    var tx0 = 0, ty0 = 0;
    gridEl.addEventListener('touchstart', function (e) {
      tx0 = e.touches[0].clientX;
      ty0 = e.touches[0].clientY;
    }, { passive: true });
    gridEl.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx0;
      var dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }, { passive: true });

    initBoard();
    render();
    
    resolveEls();
    render();
  }

  window.Site.open2048 = open2048;

})();
