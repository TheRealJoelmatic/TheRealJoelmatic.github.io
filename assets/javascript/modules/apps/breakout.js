window.Site = window.Site || {};

(function () {

  function openBreakout() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-bars-staggered" style="margin-right:6px;color:var(--yellow)"></i>breakout',
      520, 560, 'breakout-window'
    );
    if (!r) return;

    var W = 480, H = 450;
    var PAD_H = 10;
    var BALL_R = 7;
    var BRICK_COLS = 8;
    var BRICK_ROWS = 6;
    var BRICK_W = 52;
    var BRICK_H = 16;
    var BRICK_GAP = 4;
    var BRICK_MARGIN_X = (W - (BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP)) / 2;
    var BRICK_MARGIN_Y = 42;

    var running = true;
    var mode = null;
    var started = false;
    var gameOver = false;

    var padX, padW, padY;
    var ballX, ballY, ballVX, ballVY, launched;
    var bricks = [], drops = [];
    var score, lives, level;
    var lastTime = 0;

    var MODES = {
      classic: { label: 'Classic', lives: 3, speed: 5.0, movingBricks: false, powerups: false },
      rush: { label: 'Powerup Rush', lives: 3, speed: 5.3, movingBricks: false, powerups: true },
      chaos: { label: 'Chaos', lives: 2, speed: 6.0, movingBricks: true, powerups: true },
    };

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--base);overflow:hidden;';

    var stats = document.createElement('div');
    stats.style.cssText = 'width:100%;display:flex;justify-content:space-between;align-items:center;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--text);';
    stats.innerHTML = '<span id="br-mode">Mode: -</span><span id="br-score">Score: 0</span><span id="br-life">Lives: 0</span>';
    r.body.appendChild(stats);

    var hint = document.createElement('div');
    hint.style.cssText = 'align-self:stretch;font-size:11px;color:var(--subtext0);font-family:"JetBrains Mono",monospace;';
    hint.textContent = 'Mouse or Left/Right to move • Space to launch';
    r.body.appendChild(hint);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;line-height:0;';
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'display:block;border-radius:6px;cursor:none;';
    wrap.appendChild(canvas);
    r.body.appendChild(wrap);

    var modeEl = stats.querySelector('#br-mode');
    var scoreEl = stats.querySelector('#br-score');
    var lifeEl = stats.querySelector('#br-life');

    function updateHud() {
      modeEl.textContent = 'Mode: ' + (mode ? MODES[mode].label : '-');
      scoreEl.textContent = 'Score: ' + score;
      lifeEl.textContent = 'Lives: ' + lives;
    }

    function showMenu() {
      mode = null;
      started = false;
      gameOver = false;
      score = 0;
      lives = 0;
      updateHud();
      draw();

      var menu = document.createElement('div');
      menu.style.cssText = 'position:absolute;inset:42px 8px 8px 8px;display:flex;align-items:center;justify-content:center;background:rgba(17,17,27,0.72);border-radius:8px;z-index:3;';
      var inner = document.createElement('div');
      inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:280px;';
      inner.innerHTML = '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:22px;font-weight:700;color:var(--text)">BREAKOUT 2.0</div><div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--subtext0)">Choose variant</div>';

      [
        { key: 'classic', label: 'Classic' },
        { key: 'rush', label: 'Powerup Rush' },
        { key: 'chaos', label: 'Chaos (moving bricks)' },
      ].forEach(function (m) {
        var b = document.createElement('button');
        b.className = 'g2048-btn';
        b.textContent = m.label;
        b.addEventListener('click', function () {
          mode = m.key;
          startMode();
          if (menu.parentNode) menu.parentNode.removeChild(menu);
        });
        inner.appendChild(b);
      });

      menu.appendChild(inner);
      r.body.appendChild(menu);
    }

    function startMode() {
      var cfg = MODES[mode];
      padW = 82;
      padY = H - 30;
      padX = W / 2 - padW / 2;
      ballX = W / 2;
      ballY = padY - BALL_R - 2;
      ballVX = 0;
      ballVY = 0;
      launched = false;
      score = 0;
      lives = cfg.lives;
      level = 1;
      drops = [];
      makeBricks();
      started = true;
      gameOver = false;
      updateHud();
    }

    function makeBricks() {
      bricks = [];
      for (var row = 0; row < BRICK_ROWS; row++) {
        for (var col = 0; col < BRICK_COLS; col++) {
          bricks.push({
            baseX: BRICK_MARGIN_X + col * (BRICK_W + BRICK_GAP),
            x: BRICK_MARGIN_X + col * (BRICK_W + BRICK_GAP),
            y: BRICK_MARGIN_Y + row * (BRICK_H + BRICK_GAP),
            alive: true,
            phase: Math.random() * Math.PI * 2,
            hue: row,
          });
        }
      }
    }

    function launch() {
      if (!started || gameOver || launched) return;
      launched = true;
      var speed = MODES[mode].speed;
      var angle = -Math.PI / 2 + (Math.random() * 0.8 - 0.4);
      ballVX = Math.cos(angle) * speed;
      ballVY = Math.sin(angle) * speed;
    }

    function addDrop(x, y) {
      if (!MODES[mode].powerups) return;
      if (Math.random() > 0.26) return;
      var type = Math.random() < 0.65 ? 'expand' : 'life';
      drops.push({ x: x, y: y, vy: 1.8, type: type });
    }

    function collectDrop(d) {
      if (d.type === 'expand') {
        padW = Math.min(130, padW + 18);
      } else if (d.type === 'life') {
        lives++;
      }
      updateHud();
    }

    function loseBall() {
      lives--;
      updateHud();
      if (lives <= 0) {
        gameOver = true;
        started = false;
        return;
      }
      launched = false;
      ballVX = 0;
      ballVY = 0;
      ballX = padX + padW / 2;
      ballY = padY - BALL_R - 2;
    }

    function nextLevel() {
      level++;
      makeBricks();
      launched = false;
      ballVX = 0;
      ballVY = 0;
      ballX = padX + padW / 2;
      ballY = padY - BALL_R - 2;
    }

    function update(dt) {
      if (!started || !mode || gameOver) return;

      var cfg = MODES[mode];

      if (!launched) {
        ballX = padX + padW / 2;
      }

      if (cfg.movingBricks) {
        var t = performance.now() * 0.001;
        bricks.forEach(function (b) {
          if (!b.alive) return;
          b.x = b.baseX + Math.sin(t * 1.8 + b.phase) * 7;
        });
      }

      if (launched) {
        var d60 = dt * 60;
        ballX += ballVX * d60;
        ballY += ballVY * d60;

        if (ballX - BALL_R < 0) {
          ballX = BALL_R;
          ballVX = Math.abs(ballVX);
        }
        if (ballX + BALL_R > W) {
          ballX = W - BALL_R;
          ballVX = -Math.abs(ballVX);
        }
        if (ballY - BALL_R < 0) {
          ballY = BALL_R;
          ballVY = Math.abs(ballVY);
        }

        if (ballY + BALL_R > padY && ballY - BALL_R < padY + PAD_H && ballX > padX - BALL_R && ballX < padX + padW + BALL_R) {
          ballY = padY - BALL_R;
          var rel = (ballX - (padX + padW / 2)) / (padW / 2);
          var speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
          var angle = rel * 1.15 - Math.PI / 2;
          ballVX = Math.cos(angle) * speed;
          ballVY = Math.sin(angle) * speed;
          if (ballVY > 0) ballVY = -ballVY;
        }

        if (ballY - BALL_R > H) loseBall();

        for (var i = 0; i < bricks.length; i++) {
          var br = bricks[i];
          if (!br.alive) continue;
          if (ballX + BALL_R > br.x && ballX - BALL_R < br.x + BRICK_W && ballY + BALL_R > br.y && ballY - BALL_R < br.y + BRICK_H) {
            br.alive = false;
            score += 10;
            updateHud();
            addDrop(br.x + BRICK_W / 2, br.y + BRICK_H / 2);

            var overlapL = ballX + BALL_R - br.x;
            var overlapR = br.x + BRICK_W - (ballX - BALL_R);
            var overlapT = ballY + BALL_R - br.y;
            var overlapB = br.y + BRICK_H - (ballY - BALL_R);
            var minH = Math.min(overlapL, overlapR);
            var minV = Math.min(overlapT, overlapB);
            if (minV < minH) ballVY = -ballVY;
            else ballVX = -ballVX;
            break;
          }
        }

        var alive = 0;
        for (var a = 0; a < bricks.length; a++) {
          if (bricks[a].alive) alive++;
        }
        if (alive === 0) nextLevel();
      }

      for (var di = drops.length - 1; di >= 0; di--) {
        var d = drops[di];
        d.y += d.vy * dt * 60;
        if (d.y > H + 20) {
          drops.splice(di, 1);
          continue;
        }
        if (d.y > padY - 6 && d.y < padY + PAD_H + 6 && d.x > padX && d.x < padX + padW) {
          collectDrop(d);
          drops.splice(di, 1);
        }
      }
    }

    function draw() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, W, H);

      bricks.forEach(function (b) {
        if (!b.alive) return;
        var colors = ['#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#89dceb', '#89b4fa'];
        ctx.fillStyle = colors[b.hue % colors.length];
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 3);
          ctx.fill();
        } else {
          ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
        }
      });

      ctx.fillStyle = '#cdd6f4';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(padX, padY, padW, PAD_H, 4);
        ctx.fill();
      } else {
        ctx.fillRect(padX, padY, padW, PAD_H);
      }

      ctx.fillStyle = '#f9e2af';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      drops.forEach(function (d) {
        ctx.fillStyle = d.type === 'expand' ? '#89b4fa' : '#a6e3a1';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(d.x - 10, d.y - 7, 20, 14, 4);
          ctx.fill();
        } else {
          ctx.fillRect(d.x - 10, d.y - 7, 20, 14);
        }
        ctx.fillStyle = '#11111b';
        ctx.font = '700 10px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText(d.type === 'expand' ? 'E' : '+', d.x, d.y + 3);
      });
      ctx.textAlign = 'start';

      if (!launched && started && !gameOver) {
        ctx.fillStyle = 'rgba(205,214,244,0.5)';
        ctx.font = '13px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Click / Space to launch', W / 2, H / 2 + 42);
        ctx.textAlign = 'start';
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(17,17,27,0.66)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f38ba8';
        ctx.font = '700 30px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', W / 2, H / 2 - 8);
        ctx.fillStyle = '#cdd6f4';
        ctx.font = '400 12px "JetBrains Mono",monospace';
        ctx.fillText('Press Enter for mode menu', W / 2, H / 2 + 18);
        ctx.textAlign = 'start';
      }
    }

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (W / rect.width);
      padX = Math.max(0, Math.min(W - padW, mx - padW / 2));
    });
    canvas.addEventListener('click', function () {
      launch();
    });
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var tx = (e.touches[0].clientX - rect.left) * (W / rect.width);
      padX = Math.max(0, Math.min(W - padW, tx - padW / 2));
    }, { passive: false });

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKey);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        return;
      }

      if (e.type === 'keydown') {
        if (e.key === ' ' || e.key === 'Enter') {
          if (gameOver && e.key === 'Enter') {
            e.preventDefault();
            showMenu();
            return;
          }
          e.preventDefault();
          launch();
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          padX = Math.max(0, padX - 24);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          padX = Math.min(W - padW, padX + 24);
        }
      }
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);

    function loop(ts) {
      if (!running || !document.body.contains(r.win)) {
        running = false;
        return;
      }
      var dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.05) : 0.016;
      lastTime = ts;
      update(dt);
      draw();
      requestAnimationFrame(loop);
    }

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKey);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    padW = 82;
    padY = H - 30;
    padX = W / 2 - padW / 2;
    ballX = W / 2;
    ballY = padY - BALL_R - 2;
    score = 0;
    lives = 0;
    drops = [];
    updateHud();
    draw();
    showMenu();
    requestAnimationFrame(loop);
  }

  window.Site.openBreakout = openBreakout;

})();
