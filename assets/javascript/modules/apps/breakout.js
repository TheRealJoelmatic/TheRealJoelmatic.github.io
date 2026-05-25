





window.Site = window.Site || {};

(function () {

  function openBreakout() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-bars-staggered" style="margin-right:6px;color:var(--yellow)"></i>breakout',
      480, 520, 'breakout-window'
    );
    if (!r) return;

    var W = 460, H = 440;
    var PAD_W = 80, PAD_H = 10, PAD_Y = H - 28;
    var BALL_R = 7;
    var BRICK_COLS = 8, BRICK_ROWS = 6;
    var BRICK_W = 50, BRICK_H = 16, BRICK_GAP = 4;
    var BRICK_MARGIN_X = (W - (BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP)) / 2;
    var BRICK_MARGIN_Y = 36;
    var BRICK_COLORS = ['#f38ba8','#fab387','#f9e2af','#a6e3a1','#89dceb','#89b4fa'];

    var padX, ballX, ballY, ballVX, ballVY, bricks, score, lives, running, launched, level;
    var lastTime = 0;
    var SPEED = 5;

    function init() {
      padX    = W / 2 - PAD_W / 2;
      ballX   = W / 2;
      ballY   = PAD_Y - BALL_R - 2;
      ballVX  = 0;
      ballVY  = 0;
      score   = 0;
      lives   = 3;
      level   = 1;
      launched = false;
      running  = true;
      makeBricks();
      updateInfo();
    }

    function makeBricks() {
      bricks = [];
      for (var row = 0; row < BRICK_ROWS; row++) {
        for (var col = 0; col < BRICK_COLS; col++) {
          bricks.push({
            x: BRICK_MARGIN_X + col * (BRICK_W + BRICK_GAP),
            y: BRICK_MARGIN_Y + row * (BRICK_H + BRICK_GAP),
            color: BRICK_COLORS[row],
            alive: true,
          });
        }
      }
    }

    function launch() {
      if (launched) return;
      launched = true;
      var angle = -Math.PI / 2 + (Math.random() * 0.8 - 0.4);
      ballVX = Math.cos(angle) * SPEED;
      ballVY = Math.sin(angle) * SPEED;
    }

    function update(dt) {
      if (!launched) {
        ballX = padX + PAD_W / 2;
        return;
      }

      var spd = dt * 60;
      ballX += ballVX * spd;
      ballY += ballVY * spd;

      
      if (ballX - BALL_R < 0)  { ballX = BALL_R;      ballVX = Math.abs(ballVX); }
      if (ballX + BALL_R > W)  { ballX = W - BALL_R;  ballVX = -Math.abs(ballVX); }
      if (ballY - BALL_R < 0)  { ballY = BALL_R;      ballVY = Math.abs(ballVY); }

      
      if (ballY + BALL_R > PAD_Y && ballY - BALL_R < PAD_Y + PAD_H &&
          ballX > padX - BALL_R && ballX < padX + PAD_W + BALL_R) {
        ballY = PAD_Y - BALL_R;
        var rel = (ballX - (padX + PAD_W / 2)) / (PAD_W / 2);
        var speed = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
        var angle = rel * 1.2 - Math.PI / 2;
        ballVX = Math.cos(angle) * speed;
        ballVY = Math.sin(angle) * speed;
        if (ballVY > 0) ballVY = -ballVY;
      }

      
      if (ballY - BALL_R > H) {
        lives--;
        updateInfo();
        if (lives <= 0) {
          running = false;
          draw();
          showMsg('<span style="color:var(--red)">Game over</span>', true);
          return;
        }
        launched = false;
        ballVX = 0; ballVY = 0;
        ballY = PAD_Y - BALL_R - 2;
      }

      
      for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i];
        if (!b.alive) continue;
        if (ballX + BALL_R > b.x && ballX - BALL_R < b.x + BRICK_W &&
            ballY + BALL_R > b.y && ballY - BALL_R < b.y + BRICK_H) {
          b.alive = false;
          score += 10;
          updateInfo();
          
          var overlapL = ballX + BALL_R - b.x;
          var overlapR = b.x + BRICK_W - (ballX - BALL_R);
          var overlapT = ballY + BALL_R - b.y;
          var overlapB = b.y + BRICK_H - (ballY - BALL_R);
          var minH = Math.min(overlapL, overlapR);
          var minV = Math.min(overlapT, overlapB);
          if (minV < minH) ballVY = -ballVY; else ballVX = -ballVX;
          break;
        }
      }

      var alive = bricks.filter(function (b) { return b.alive; }).length;
      if (alive === 0) {
        level++;
        SPEED = Math.min(10, 5 + (level - 1) * 0.5);
        makeBricks();
        launched = false;
        ballVX = 0; ballVY = 0;
        ballY = PAD_Y - BALL_R - 2;
        updateInfo();
        var flash = document.createElement('div');
        flash.className = 'breakout-over';
        flash.style.pointerEvents = 'none';
        flash.innerHTML = '<span style="color:var(--yellow)">Level ' + level + '!</span>';
        wrap.appendChild(flash);
        setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 900);
      }
    }

    function draw() {
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, W, H);

      
      bricks.forEach(function (b) {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 3) : ctx.rect(b.x, b.y, BRICK_W, BRICK_H);
        ctx.fill();
      });

      
      ctx.fillStyle = '#cdd6f4';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(padX, PAD_Y, PAD_W, PAD_H, 4) : ctx.rect(padX, PAD_Y, PAD_W, PAD_H);
      ctx.fill();

      
      ctx.fillStyle = '#f9e2af';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      
      if (!launched && running) {
        ctx.fillStyle = 'rgba(205,214,244,0.5)';
        ctx.font = '13px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Click / Space to launch', W / 2, H / 2 + 40);
        ctx.textAlign = 'start';
      }
    }

    function updateInfo() {
      if (scoreEl) scoreEl.textContent = 'Score: ' + score + '   Lvl: ' + level + '   Lives: ' + '♥'.repeat(Math.max(0, lives));
    }

    function showMsg(html, withBtn) {
      var old = wrap.querySelector('.breakout-over');
      if (old) old.parentNode.removeChild(old);
      var msg = document.createElement('div');
      msg.className = 'breakout-over';
      msg.innerHTML = html + (withBtn ? '<br><button class="breakout-btn">New game</button>' : '');
      if (withBtn) {
        msg.querySelector('button').addEventListener('click', function () {
          var o = wrap.querySelector('.breakout-over');
          if (o) o.parentNode.removeChild(o);
          init(); draw();
        });
      }
      wrap.appendChild(msg);
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
    scoreEl.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:13px;color:var(--text);align-self:stretch;';
    scoreEl.textContent = 'Score: 0   Lives: ♥♥♥';
    r.body.appendChild(scoreEl);

    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px;color:var(--subtext0);font-family:"JetBrains Mono",monospace;align-self:stretch;';
    hint.textContent = 'Mouse or ← → to move paddle';
    r.body.appendChild(hint);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;line-height:0;';
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.cssText = 'display:block;border-radius:6px;cursor:none;';

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      var mx = (e.clientX - rect.left) * (W / rect.width);
      padX = Math.max(0, Math.min(W - PAD_W, mx - PAD_W / 2));
    });
    canvas.addEventListener('click', launch);
    canvas.addEventListener('touchmove', function (e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      var tx = (e.touches[0].clientX - rect.left) * (W / rect.width);
      padX = Math.max(0, Math.min(W - PAD_W, tx - PAD_W / 2));
    }, { passive: false });

    wrap.appendChild(canvas);
    r.body.appendChild(wrap);

    var KEY_HANDLER = function (e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', KEY_HANDLER);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); launch(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); padX = Math.max(0, padX - 20); }
      if (e.key === 'ArrowRight') { e.preventDefault(); padX = Math.min(W - PAD_W, padX + 20); }
    };
    document.addEventListener('keydown', KEY_HANDLER);

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', KEY_HANDLER);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    init(); draw();
    requestAnimationFrame(loop);
  }

  window.Site.openBreakout = openBreakout;

})();
