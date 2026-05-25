





window.Site = window.Site || {};

(function () {

  function openSnake() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-worm" style="margin-right:6px;color:var(--green)"></i>snake',
      420, 480, 'snake-window'
    );
    if (!r) return;

    var COLS = 24, ROWS = 20;
    var CELL = 18; 
    var INTERVAL = 120; 

    var snake, dir, nextDir, food, alive, score, hiscore = 0, timer;

    function init() {
      var mid = Math.floor(COLS / 2);
      var mid2 = Math.floor(ROWS / 2);
      snake = [
        { x: mid,     y: mid2 },
        { x: mid - 1, y: mid2 },
        { x: mid - 2, y: mid2 },
      ];
      dir = nextDir = { x: 1, y: 0 };
      food = placeFood();
      alive = true;
      score = 0;
      updateScore();
    }

    function placeFood() {
      var free = [];
      for (var x = 0; x < COLS; x++) {
        for (var y = 0; y < ROWS; y++) {
          if (!snake.some(function (s) { return s.x === x && s.y === y; })) {
            free.push({ x: x, y: y });
          }
        }
      }
      return free[Math.floor(Math.random() * free.length)];
    }

    function tick() {
      if (!alive) return;
      dir = nextDir;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        die(); return;
      }
      
      if (snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
        die(); return;
      }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score++;
        if (score > hiscore) hiscore = score;
        updateScore();
        food = placeFood();
        if (!food) { win(); return; }
      } else {
        snake.pop();
      }
      draw();
    }

    function die() {
      alive = false;
      clearInterval(timer);
      draw();
      var msg = document.createElement('div');
      msg.className = 'snake-over';
      msg.innerHTML = '<span style="color:var(--red)">Game over</span><br>Score: ' + score +
        '<br><button class="snake-btn">Restart</button>';
      msg.querySelector('button').addEventListener('click', restart);
      canvas.parentNode.appendChild(msg);
    }

    function win() {
      alive = false;
      clearInterval(timer);
      var msg = document.createElement('div');
      msg.className = 'snake-over';
      msg.innerHTML = '<span style="color:var(--yellow)">You win! 🎉</span><br><button class="snake-btn">Restart</button>';
      msg.querySelector('button').addEventListener('click', restart);
      canvas.parentNode.appendChild(msg);
    }

    function restart() {
      var old = wrap.querySelector('.snake-over');
      if (old) old.parentNode.removeChild(old);
      init();
      draw();
      clearInterval(timer);
      timer = setInterval(tick, INTERVAL);
    }

    function updateScore() {
      if (scoreEl) scoreEl.textContent = score;
      if (hiEl)    hiEl.textContent    = hiscore;
    }

    function draw() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      
      ctx.strokeStyle = '#313244';
      ctx.lineWidth = 0.5;
      for (var gx = 0; gx <= COLS; gx++) {
        ctx.beginPath(); ctx.moveTo(gx * CELL, 0); ctx.lineTo(gx * CELL, ROWS * CELL); ctx.stroke();
      }
      for (var gy = 0; gy <= ROWS; gy++) {
        ctx.beginPath(); ctx.moveTo(0, gy * CELL); ctx.lineTo(COLS * CELL, gy * CELL); ctx.stroke();
      }

      
      ctx.fillStyle = '#f38ba8';
      ctx.beginPath();
      ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      
      snake.forEach(function (seg, i) {
        ctx.fillStyle = i === 0 ? '#a6e3a1' : '#40a02b';
        var pad = i === 0 ? 1 : 2;
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 4)
          : ctx.rect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
        ctx.fill();
      });

      if (!alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    
    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:12px;display:flex;flex-direction:column;align-items:center;gap:10px;background:var(--base);overflow:hidden;';

    var topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;gap:16px;align-items:center;font-family:"JetBrains Mono",monospace;font-size:13px;color:var(--text);';
    topRow.innerHTML =
      '<span>Score: <b id="snake-score">0</b></span>' +
      '<span>Best: <b id="snake-hi">0</b></span>';
    r.body.appendChild(topRow);

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;color:var(--subtext0);font-family:"JetBrains Mono",monospace;';
    hint.textContent = 'Arrow keys / WASD  •  click to start';
    r.body.appendChild(hint);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;';

    var canvas = document.createElement('canvas');
    canvas.width  = COLS * CELL;
    canvas.height = ROWS * CELL;
    canvas.style.cssText = 'display:block;border-radius:6px;cursor:pointer;';
    wrap.appendChild(canvas);
    r.body.appendChild(wrap);

    var scoreEl = r.body.querySelector('#snake-score');
    var hiEl    = r.body.querySelector('#snake-hi');

    var DIRS = {
      ArrowLeft:  { x: -1, y:  0 }, ArrowRight: { x: 1, y: 0 },
      ArrowUp:    { x:  0, y: -1 }, ArrowDown:  { x: 0, y: 1 },
      a: { x: -1, y: 0 }, d: { x: 1, y: 0 }, w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
      A: { x: -1, y: 0 }, D: { x: 1, y: 0 }, W: { x: 0, y: -1 }, S: { x: 0, y: 1 },
    };

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        clearInterval(timer);
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        return;
      }
      var d = DIRS[e.key];
      if (!d) return;
      e.preventDefault();
      
      if (d.x !== 0 && dir.x !== 0) return;
      if (d.y !== 0 && dir.y !== 0) return;
      nextDir = d;
    }
    document.addEventListener('keydown', onKey);

    canvas.addEventListener('click', function () {
      if (!alive) restart();
    });

    
    var tx0 = 0, ty0 = 0;
    canvas.addEventListener('touchstart', function (e) {
      tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY;
    }, { passive: true });
    canvas.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - tx0;
      var dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) > Math.abs(dy)) {
        nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
    }, { passive: true });

    init();
    draw();
    timer = setInterval(tick, INTERVAL);
  }

  window.Site.openSnake = openSnake;

})();
