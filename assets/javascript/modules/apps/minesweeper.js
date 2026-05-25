





window.Site = window.Site || {};

(function () {

  function openMinesweeper() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-bomb" style="margin-right:6px;color:var(--red)"></i>minesweeper',
      440, 520, 'msweeper-window'
    );
    if (!r) return;

    var COLS = 16, ROWS = 16, MINES = 40;
    var CELL = 24; 

    var board, revealed, flagged, mineSet, alive, won, firstClick, startTime, timerEl, timerTick;

    function idx(x, y) { return y * COLS + x; }

    function neighbors(x, y) {
      var res = [];
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          var nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) res.push({ x: nx, y: ny });
        }
      }
      return res;
    }

    function init() {
      board     = new Array(COLS * ROWS).fill(0);
      revealed  = new Array(COLS * ROWS).fill(false);
      flagged   = new Array(COLS * ROWS).fill(false);
      mineSet   = new Set();
      alive     = true;
      won       = false;
      firstClick = true;
      startTime  = null;
      clearInterval(timerTick);
      if (timerEl) timerEl.textContent = '000';
      updateMineCount();
    }

    function placeMines(safeX, safeY) {
      var safeIdx = idx(safeX, safeY);
      var cells = [];
      for (var i = 0; i < COLS * ROWS; i++) {
        if (i !== safeIdx) cells.push(i);
      }
      
      for (var m = 0; m < MINES; m++) {
        var j = m + Math.floor(Math.random() * (cells.length - m));
        var tmp = cells[m]; cells[m] = cells[j]; cells[j] = tmp;
        mineSet.add(cells[m]);
        board[cells[m]] = -1;
      }
      
      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          if (board[idx(x, y)] === -1) continue;
          var count = neighbors(x, y).filter(function (n) { return board[idx(n.x, n.y)] === -1; }).length;
          board[idx(x, y)] = count;
        }
      }
    }

    function reveal(x, y) {
      var i = idx(x, y);
      if (revealed[i] || flagged[i]) return;
      revealed[i] = true;
      if (board[i] === 0) {
        neighbors(x, y).forEach(function (n) { reveal(n.x, n.y); });
      }
    }

    function checkWin() {
      var unrevealed = 0;
      for (var i = 0; i < COLS * ROWS; i++) {
        if (!revealed[i]) unrevealed++;
      }
      return unrevealed === MINES;
    }

    function handleClick(x, y) {
      if (!alive) return;
      var i = idx(x, y);
      if (flagged[i]) return;
      if (revealed[i]) {
        
        var neighs = neighbors(x, y);
        var flagCount = neighs.filter(function (n) { return flagged[idx(n.x, n.y)]; }).length;
        if (flagCount === board[i]) {
          neighs.forEach(function (n) {
            if (!flagged[idx(n.x, n.y)]) clickCell(n.x, n.y);
          });
        }
        return;
      }
      clickCell(x, y);
    }

    function clickCell(x, y) {
      if (firstClick) {
        firstClick = false;
        placeMines(x, y);
        startTime = Date.now();
        timerTick = setInterval(function () {
          if (!alive) { clearInterval(timerTick); return; }
          var secs = Math.floor((Date.now() - startTime) / 1000);
          if (timerEl) timerEl.textContent = String(Math.min(secs, 999)).padStart(3, '0');
        }, 500);
      }
      var i = idx(x, y);
      if (board[i] === -1) {
        revealed[i] = true;
        alive = false;
        clearInterval(timerTick);
        revealAllMines();
        drawBoard();
        showMsg('<span style="color:var(--red)">💥 Boom!</span>', true);
        return;
      }
      reveal(x, y);
      if (checkWin()) {
        won = true;
        alive = false;
        clearInterval(timerTick);
        drawBoard();
        showMsg('<span style="color:var(--yellow)">You win! 🎉</span>', true);
        return;
      }
      drawBoard();
    }

    function handleRightClick(e, x, y) {
      e.preventDefault();
      if (!alive) return;
      var i = idx(x, y);
      if (revealed[i]) return;
      flagged[i] = !flagged[i];
      updateMineCount();
      drawBoard();
    }

    function revealAllMines() {
      mineSet.forEach(function (i) { revealed[i] = true; });
    }

    function updateMineCount() {
      var flagCount = flagged.filter(Boolean).length;
      if (mineCountEl) mineCountEl.textContent = String(Math.max(0, MINES - flagCount)).padStart(3, '0');
    }

    var NUM_COLORS = ['', '#6495ed', '#228b22', '#dc143c', '#00008b', '#800000', '#20b2aa', '#000', '#808080'];

    function drawBoard() {
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
          var i   = idx(x, y);
          var px  = x * CELL;
          var py  = y * CELL;
          var rev = revealed[i];
          var flg = flagged[i];
          var val = board[i];

          
          ctx.fillStyle = rev ? '#2a2a3e' : '#45475a';
          ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);

          if (!rev) {
            
            ctx.fillStyle = '#585b70';
            ctx.fillRect(px + 1, py + 1, CELL - 2, 2);
            ctx.fillRect(px + 1, py + 1, 2, CELL - 2);
            ctx.fillStyle = '#313244';
            ctx.fillRect(px + 1, py + CELL - 3, CELL - 2, 2);
            ctx.fillRect(px + CELL - 3, py + 1, 2, CELL - 2);
          }

          ctx.font = 'bold ' + (CELL - 8) + 'px "JetBrains Mono",monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          var cx = px + CELL / 2;
          var cy = py + CELL / 2;

          if (flg && !rev) {
            ctx.fillStyle = '#f38ba8';
            ctx.fillText('🚩', cx, cy);
          } else if (rev && val === -1) {
            ctx.fillStyle = '#f38ba8';
            ctx.fillText('💣', cx, cy);
          } else if (rev && val > 0) {
            ctx.fillStyle = NUM_COLORS[val] || '#cdd6f4';
            ctx.fillText(val, cx, cy);
          }
        }
      }
    }

    function showMsg(html, withBtn) {
      var old = wrap.querySelector('.msweeper-over');
      if (old) old.parentNode.removeChild(old);
      var msg = document.createElement('div');
      msg.className = 'msweeper-over';
      msg.innerHTML = html + (withBtn ? '<br><button class="msweeper-btn">New game</button>' : '');
      if (withBtn) msg.querySelector('button').addEventListener('click', function () {
        var o = wrap.querySelector('.msweeper-over');
        if (o) o.parentNode.removeChild(o);
        init();
        drawBoard();
      });
      wrap.appendChild(msg);
    }

    
    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:12px;display:flex;flex-direction:column;align-items:center;gap:10px;background:var(--base);overflow:hidden;';

    var statusBar = document.createElement('div');
    statusBar.style.cssText = 'display:flex;gap:20px;align-items:center;font-family:"JetBrains Mono",monospace;font-size:13px;color:var(--text);background:var(--surface0);padding:6px 16px;border-radius:6px;width:' + (COLS * CELL) + 'px;box-sizing:border-box;justify-content:space-between;';
    statusBar.innerHTML =
      '<span>💣 <b id="msw-mines">040</b></span>' +
      '<button id="msw-reset" style="background:none;border:1px solid var(--surface1);border-radius:4px;padding:2px 8px;color:var(--text);cursor:pointer;font-size:14px;">🙂</button>' +
      '<span>⏱ <b id="msw-timer">000</b></span>';
    r.body.appendChild(statusBar);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;line-height:0;';

    var canvas = document.createElement('canvas');
    canvas.width  = COLS * CELL;
    canvas.height = ROWS * CELL;
    canvas.style.cssText = 'display:block;border-radius:4px;cursor:pointer;';

    canvas.addEventListener('click', function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = Math.floor((e.clientX - rect.left) / CELL);
      var y = Math.floor((e.clientY - rect.top)  / CELL);
      if (x >= 0 && x < COLS && y >= 0 && y < ROWS) handleClick(x, y);
    });
    canvas.addEventListener('contextmenu', function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = Math.floor((e.clientX - rect.left) / CELL);
      var y = Math.floor((e.clientY - rect.top)  / CELL);
      if (x >= 0 && x < COLS && y >= 0 && y < ROWS) handleRightClick(e, x, y);
    });

    wrap.appendChild(canvas);
    r.body.appendChild(wrap);

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;color:var(--subtext0);font-family:"JetBrains Mono",monospace;';
    hint.textContent = 'Left-click reveal  •  right-click flag  •  click number to chord';
    r.body.appendChild(hint);

    var mineCountEl = r.body.querySelector('#msw-mines');
    var timerEl     = r.body.querySelector('#msw-timer');

    r.body.querySelector('#msw-reset').addEventListener('click', function () {
      var o = wrap.querySelector('.msweeper-over');
      if (o) o.parentNode.removeChild(o);
      init();
      drawBoard();
    });

    init();
    drawBoard();
  }

  window.Site.openMinesweeper = openMinesweeper;

})();
