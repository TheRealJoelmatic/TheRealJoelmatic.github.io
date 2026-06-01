window.Site = window.Site || {};

(function () {

  function openPong() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-table-tennis-paddle-ball" style="margin-right:6px;color:var(--sky)"></i>pong',
      620, 420, 'pong-window'
    );
    if (!r) return;

    var W = 580, H = 320;
    var PAD_W = 10, PAD_H = 64;
    var BALL_R = 7;
    var WIN_SCORE = 7;

    var running = true;
    var mode = null;
    var started = false;
    var gameOver = false;

    var playerY, enemyY, playerScore, enemyScore;
    var playerPrevY, enemyPrevY;
    var ballX, ballY, ballVX, ballVY;
    var lastTime = 0;
    var keys = {};

    var MODES = {
      classic: { label: 'Classic', ai: true, aiSpeed: 4.2, spin: false, twoPlayer: false },
      spin: { label: 'Spin', ai: true, aiSpeed: 4.4, spin: true, twoPlayer: false },
      duel: { label: 'Duel 2P', ai: false, aiSpeed: 0, spin: true, twoPlayer: true },
    };

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--base);overflow:hidden;';

    var info = document.createElement('div');
    info.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--text);';
    info.innerHTML = '<span id="pong-mode">Mode: -</span><span id="pong-score">0 : 0</span><span id="pong-hint">W/S</span>';
    r.body.appendChild(info);

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'display:block;border-radius:6px;';
    r.body.appendChild(canvas);

    var modeEl = info.querySelector('#pong-mode');
    var scoreEl = info.querySelector('#pong-score');
    var hintEl = info.querySelector('#pong-hint');

    function updateHud() {
      modeEl.textContent = 'Mode: ' + (mode ? MODES[mode].label : '-');
      scoreEl.textContent = playerScore + ' : ' + enemyScore;
      hintEl.textContent = mode === 'duel' ? 'P1 W/S  P2 Up/Down' : 'W/S or Up/Down';
    }

    function showMenu() {
      mode = null;
      started = false;
      gameOver = false;
      playerScore = 0;
      enemyScore = 0;
      updateHud();
      draw();

      var menu = document.createElement('div');
      menu.style.cssText = 'position:absolute;inset:42px 8px 8px 8px;display:flex;align-items:center;justify-content:center;background:rgba(17,17,27,0.72);border-radius:8px;z-index:2;';
      var inner = document.createElement('div');
      inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:260px;';
      inner.innerHTML = '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:22px;font-weight:700;color:var(--text)">PONG</div><div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--subtext0)">Select mode</div>';

      [
        { key: 'classic', label: 'Classic' },
        { key: 'spin', label: 'Spin Ball' },
        { key: 'duel', label: 'Duel 2P' },
      ].forEach(function (m) {
        var b = document.createElement('button');
        b.className = 'g2048-btn';
        b.textContent = m.label;
        b.addEventListener('click', function () {
          mode = m.key;
          resetMatch();
          started = true;
          gameOver = false;
          if (menu.parentNode) menu.parentNode.removeChild(menu);
        });
        inner.appendChild(b);
      });

      menu.appendChild(inner);
      r.body.appendChild(menu);
    }

    function resetBall(dir) {
      ballX = W / 2;
      ballY = H / 2;
      var angle = (Math.random() * 0.7 - 0.35);
      var speed = 5.0;
      ballVX = Math.cos(angle) * speed * dir;
      ballVY = Math.sin(angle) * speed;
    }

    function resetMatch() {
      playerY = H / 2 - PAD_H / 2;
      enemyY = H / 2 - PAD_H / 2;
      playerPrevY = playerY;
      enemyPrevY = enemyY;
      playerScore = 0;
      enemyScore = 0;
      resetBall(Math.random() < 0.5 ? -1 : 1);
      updateHud();
    }

    function movePaddles(dt) {
      var spd = 5.2 * dt * 60;
      playerPrevY = playerY;
      enemyPrevY = enemyY;

      var cfg = MODES[mode];

      if (cfg.twoPlayer) {
        if (keys.w || keys.W) playerY -= spd;
        if (keys.s || keys.S) playerY += spd;
        if (keys.ArrowUp) enemyY -= spd;
        if (keys.ArrowDown) enemyY += spd;
      } else {
        if (keys.w || keys.W || keys.ArrowUp) playerY -= spd;
        if (keys.s || keys.S || keys.ArrowDown) playerY += spd;
        var aiCenter = enemyY + PAD_H / 2;
        var aiTarget = ballY;
        var aiMove = cfg.aiSpeed * dt * 60;
        if (aiCenter < aiTarget - 4) enemyY += Math.min(aiMove, aiTarget - 4 - aiCenter);
        else if (aiCenter > aiTarget + 4) enemyY -= Math.min(aiMove, aiCenter - aiTarget - 4);
      }

      playerY = Math.max(0, Math.min(H - PAD_H, playerY));
      enemyY = Math.max(0, Math.min(H - PAD_H, enemyY));
    }

    function addSpin(paddleVel, sign) {
      var cfg = MODES[mode];
      if (!cfg.spin) return;
      ballVY += paddleVel * 0.22;
      var speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
      speed = Math.min(10.5, Math.max(4.5, speed));
      var nx = Math.abs(ballVX) / (Math.abs(ballVX) + Math.abs(ballVY) + 0.0001);
      ballVX = sign * Math.max(3.6, speed * nx);
      if (Math.abs(ballVY) > speed * 0.9) ballVY = (ballVY < 0 ? -1 : 1) * speed * 0.9;
    }

    function update(dt) {
      if (!started || !mode || gameOver) return;

      movePaddles(dt);

      ballX += ballVX * dt * 60;
      ballY += ballVY * dt * 60;

      if (ballY - BALL_R < 0) {
        ballY = BALL_R;
        ballVY = Math.abs(ballVY);
      }
      if (ballY + BALL_R > H) {
        ballY = H - BALL_R;
        ballVY = -Math.abs(ballVY);
      }

      var px = 22;
      if (ballX - BALL_R < px + PAD_W && ballX - BALL_R > px - 4 && ballY > playerY && ballY < playerY + PAD_H) {
        ballX = px + PAD_W + BALL_R;
        var rel = (ballY - (playerY + PAD_H / 2)) / (PAD_H / 2);
        var speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY) * 1.03;
        var angle = rel * 1.02;
        ballVX = Math.cos(angle) * speed;
        ballVY = Math.sin(angle) * speed;
        if (ballVX < 0) ballVX = -ballVX;
        addSpin(playerY - playerPrevY, 1);
      }

      var ex = W - 22 - PAD_W;
      if (ballX + BALL_R > ex && ballX + BALL_R < ex + PAD_W + 4 && ballY > enemyY && ballY < enemyY + PAD_H) {
        ballX = ex - BALL_R;
        var rel2 = (ballY - (enemyY + PAD_H / 2)) / (PAD_H / 2);
        var speed2 = Math.sqrt(ballVX * ballVX + ballVY * ballVY) * 1.03;
        var angle2 = rel2 * 1.02;
        ballVX = -Math.cos(angle2) * speed2;
        ballVY = Math.sin(angle2) * speed2;
        if (ballVX > 0) ballVX = -ballVX;
        addSpin(enemyY - enemyPrevY, -1);
      }

      if (ballX + BALL_R < 0) {
        enemyScore++;
        updateHud();
        if (enemyScore >= WIN_SCORE) {
          gameOver = true;
          started = false;
          return;
        }
        resetBall(1);
      }
      if (ballX - BALL_R > W) {
        playerScore++;
        updateHud();
        if (playerScore >= WIN_SCORE) {
          gameOver = true;
          started = false;
          return;
        }
        resetBall(-1);
      }
    }

    function draw() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, W, H);

      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#313244';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#89b4fa';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(22, playerY, PAD_W, PAD_H, 3);
        ctx.fill();
      } else {
        ctx.fillRect(22, playerY, PAD_W, PAD_H);
      }

      ctx.fillStyle = '#f38ba8';
      var ex = W - 22 - PAD_W;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(ex, enemyY, PAD_W, PAD_H, 3);
        ctx.fill();
      } else {
        ctx.fillRect(ex, enemyY, PAD_W, PAD_H);
      }

      ctx.fillStyle = '#cdd6f4';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      if (gameOver) {
        ctx.fillStyle = 'rgba(17,17,27,0.66)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#cdd6f4';
        ctx.font = '700 30px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        var text = playerScore > enemyScore ? 'Player Wins' : (mode === 'duel' ? 'Player 2 Wins' : 'CPU Wins');
        ctx.fillText(text, W / 2, H / 2 - 8);
        ctx.font = '400 12px "JetBrains Mono",monospace';
        ctx.fillText('Press Enter for mode menu', W / 2, H / 2 + 18);
        ctx.textAlign = 'start';
      }
    }

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKey);
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        if (e.type === 'keyup') keys[e.key] = false;
        return;
      }

      if (e.type === 'keydown') {
        keys[e.key] = true;
        if (e.key === 'Enter' && gameOver) {
          e.preventDefault();
          showMenu();
        }
      } else {
        keys[e.key] = false;
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

    playerY = H / 2 - PAD_H / 2;
    enemyY = H / 2 - PAD_H / 2;
    ballX = W / 2;
    ballY = H / 2;
    playerScore = 0;
    enemyScore = 0;
    updateHud();
    draw();
    showMenu();
    requestAnimationFrame(loop);
  }

  window.Site.openPong = openPong;

})();
