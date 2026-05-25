





window.Site = window.Site || {};

(function () {

  function openPong() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-table-tennis-paddle-ball" style="margin-right:6px;color:var(--sky)"></i>pong',
      560, 360, 'pong-window'
    );
    if (!r) return;

    var W = 540, H = 300;
    var PAD_W = 10, PAD_H = 60, PAD_SPEED = 5;
    var BALL_R = 7;
    var AI_SPEED = 4.2;

    var playerY, aiY, ballX, ballY, ballVX, ballVY, playerScore, aiScore, running;
    var lastTime = 0;

    function init() {
      playerY   = H / 2 - PAD_H / 2;
      aiY       = H / 2 - PAD_H / 2;
      playerScore = 0; aiScore = 0;
      resetBall(1);
      running = true;
    }

    function resetBall(dir) {
      ballX = W / 2; ballY = H / 2;
      var angle = (Math.random() * 0.6 - 0.3);
      var speed = 4.5;
      ballVX = Math.cos(angle) * speed * dir;
      ballVY = Math.sin(angle) * speed;
    }

    var keys = {};
    var KEY_HANDLER = function (e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', KEY_HANDLER);
        document.removeEventListener('keyup',   KEY_HANDLER);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        if (e.type === 'keydown') return;
        keys = {};
        return;
      }
      if (e.type === 'keydown') keys[e.key] = true;
      else keys[e.key] = false;
    };
    document.addEventListener('keydown', KEY_HANDLER);
    document.addEventListener('keyup',   KEY_HANDLER);

    function update(dt) {
      var spd = PAD_SPEED * dt * 60;

      
      if (keys['w'] || keys['W'] || keys['ArrowUp'])   playerY -= spd;
      if (keys['s'] || keys['S'] || keys['ArrowDown'])  playerY += spd;
      playerY = Math.max(0, Math.min(H - PAD_H, playerY));

      
      var aiCenter = aiY + PAD_H / 2;
      var aiSpd = AI_SPEED * dt * 60;
      if (aiCenter < ballY - 4) aiY += Math.min(aiSpd, ballY - 4 - aiCenter);
      else if (aiCenter > ballY + 4) aiY -= Math.min(aiSpd, aiCenter - ballY - 4);
      aiY = Math.max(0, Math.min(H - PAD_H, aiY));

      
      ballX += ballVX * dt * 60;
      ballY += ballVY * dt * 60;

      
      if (ballY - BALL_R < 0)  { ballY = BALL_R;      ballVY = Math.abs(ballVY); }
      if (ballY + BALL_R > H)  { ballY = H - BALL_R;  ballVY = -Math.abs(ballVY); }

      
      var px = 20;
      if (ballX - BALL_R < px + PAD_W && ballX - BALL_R > px &&
          ballY > playerY && ballY < playerY + PAD_H) {
        ballX = px + PAD_W + BALL_R;
        var rel = (ballY - (playerY + PAD_H / 2)) / (PAD_H / 2);
        var speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY) * 1.04;
        var angle = rel * 1.1;
        ballVX =  Math.cos(angle) * speed;
        ballVY =  Math.sin(angle) * speed;
        if (ballVX < 0) ballVX = -ballVX;
      }

      
      var ax = W - 20 - PAD_W;
      if (ballX + BALL_R > ax && ballX + BALL_R < ax + PAD_W &&
          ballY > aiY && ballY < aiY + PAD_H) {
        ballX = ax - BALL_R;
        var rel2 = (ballY - (aiY + PAD_H / 2)) / (PAD_H / 2);
        var speed2 = Math.sqrt(ballVX * ballVX + ballVY * ballVY) * 1.04;
        var angle2 = rel2 * 1.1;
        ballVX = -Math.cos(angle2) * speed2;
        ballVY =  Math.sin(angle2) * speed2;
        if (ballVX > 0) ballVX = -ballVX;
      }

      
      if (ballX - BALL_R < 0)  { aiScore++;     resetBall(1);  updateScore(); }
      if (ballX + BALL_R > W)  { playerScore++; resetBall(-1); updateScore(); }
    }

    function draw() {
      var ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, W, H);

      
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#313244';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);

      
      ctx.fillStyle = '#89b4fa';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(20, playerY, PAD_W, PAD_H, 3) : ctx.rect(20, playerY, PAD_W, PAD_H);
      ctx.fill();

      
      ctx.fillStyle = '#f38ba8';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(W - 20 - PAD_W, aiY, PAD_W, PAD_H, 3) : ctx.rect(W - 20 - PAD_W, aiY, PAD_W, PAD_H);
      ctx.fill();

      
      ctx.fillStyle = '#cdd6f4';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();
    }

    function updateScore() {
      if (scoreEl) scoreEl.textContent = playerScore + '  :  ' + aiScore;
    }

    function loop(ts) {
      if (!running || !document.body.contains(r.win)) { running = false; return; }
      var dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.05) : 0.016;
      lastTime = ts;
      update(dt);
      draw();
      requestAnimationFrame(loop);
    }

    
    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:8px;display:flex;flex-direction:column;align-items:center;gap:6px;background:var(--base);overflow:hidden;';

    var scoreEl = document.createElement('div');
    scoreEl.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:20px;font-weight:700;color:var(--text);letter-spacing:4px;';
    scoreEl.textContent = '0  :  0';
    r.body.appendChild(scoreEl);

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;color:var(--subtext0);font-family:"JetBrains Mono",monospace;';
    hint.textContent = 'W/S or ↑↓ to move  •  you are blue';
    r.body.appendChild(hint);

    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.cssText = 'display:block;border-radius:6px;';
    r.body.appendChild(canvas);

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', KEY_HANDLER);
        document.removeEventListener('keyup',   KEY_HANDLER);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    init();
    draw();
    requestAnimationFrame(loop);
  }

  window.Site.openPong = openPong;

})();
