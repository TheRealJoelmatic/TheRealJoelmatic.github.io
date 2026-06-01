window.Site = window.Site || {};

(function () {

  function openFlappyBird() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-dove" style="margin-right:6px;color:var(--yellow)"></i>flappy bird',
      460, 600, 'flappybird-window'
    );
    if (!r) return;

    var W = 420, H = 520;
    var FLOOR_H = 56;
    var GRAVITY = 0.36;
    var FLAP_V = -6.2;
    var PIPE_W = 62;
    var PIPE_GAP = 150;
    var PIPE_SPEED = 2.2;
    var PIPE_EVERY = 1450;
    var BIRD_X = 110;
    var BIRD_R = 14;

    var running = true;
    var started = false;
    var gameOver = false;
    var birdY = H * 0.42;
    var birdV = 0;
    var pipes = [];
    var score = 0;
    var best = 0;
    var lastTs = 0;
    var pipeTimer = 0;
    var wobbleT = 0;

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:8px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--base);overflow:hidden;';

    var top = document.createElement('div');
    top.style.cssText = 'width:100%;display:flex;justify-content:space-between;align-items:center;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--text);';
    top.innerHTML = '<span id="flappy-score">Score: 0</span><span id="flappy-best">Best: 0</span>';
    r.body.appendChild(top);

    var hint = document.createElement('div');
    hint.style.cssText = 'align-self:stretch;font-size:11px;color:var(--subtext0);font-family:"JetBrains Mono",monospace;';
    hint.textContent = 'Space / Click / Tap to flap';
    r.body.appendChild(hint);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;line-height:0;';
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'display:block;border-radius:8px;cursor:pointer;';
    wrap.appendChild(canvas);
    r.body.appendChild(wrap);

    var scoreEl = top.querySelector('#flappy-score');
    var bestEl = top.querySelector('#flappy-best');

    function updateHud() {
      scoreEl.textContent = 'Score: ' + score;
      bestEl.textContent = 'Best: ' + best;
    }

    function randGapY() {
      var min = 90;
      var max = H - FLOOR_H - PIPE_GAP - 90;
      return Math.floor(min + Math.random() * (max - min));
    }

    function addPipe() {
      pipes.push({
        x: W + PIPE_W,
        gapY: randGapY(),
        passed: false
      });
    }

    function reset() {
      started = false;
      gameOver = false;
      birdY = H * 0.42;
      birdV = 0;
      pipes = [];
      score = 0;
      pipeTimer = 0;
      wobbleT = 0;
      updateHud();
    }

    function flap() {
      if (!running) return;
      if (gameOver) {
        reset();
        return;
      }
      started = true;
      birdV = FLAP_V;
    }

    function collideCircleRect(cx, cy, cr, rx, ry, rw, rh) {
      var nx = Math.max(rx, Math.min(cx, rx + rw));
      var ny = Math.max(ry, Math.min(cy, ry + rh));
      var dx = cx - nx;
      var dy = cy - ny;
      return dx * dx + dy * dy < cr * cr;
    }

    function endGame() {
      gameOver = true;
      started = false;
      if (score > best) best = score;
      updateHud();
    }

    function update(dtMs) {
      if (gameOver) return;

      var dt = dtMs / 16.666;

      if (!started) {
        wobbleT += dtMs * 0.005;
        birdY += Math.sin(wobbleT) * 0.25;
        return;
      }

      birdV += GRAVITY * dt;
      birdY += birdV * dt;

      pipeTimer += dtMs;
      if (pipeTimer >= PIPE_EVERY) {
        pipeTimer = 0;
        addPipe();
      }

      for (var i = pipes.length - 1; i >= 0; i--) {
        var p = pipes[i];
        p.x -= PIPE_SPEED * dt;

        if (!p.passed && p.x + PIPE_W < BIRD_X) {
          p.passed = true;
          score++;
          if (score > best) best = score;
          updateHud();
        }

        if (p.x + PIPE_W < -8) pipes.splice(i, 1);
      }

      if (birdY - BIRD_R < 0) {
        birdY = BIRD_R;
        endGame();
      }
      if (birdY + BIRD_R > H - FLOOR_H) {
        birdY = H - FLOOR_H - BIRD_R;
        endGame();
      }

      for (var j = 0; j < pipes.length; j++) {
        var q = pipes[j];
        var topH = q.gapY;
        var botY = q.gapY + PIPE_GAP;
        var botH = H - FLOOR_H - botY;
        if (
          collideCircleRect(BIRD_X, birdY, BIRD_R, q.x, 0, PIPE_W, topH) ||
          collideCircleRect(BIRD_X, birdY, BIRD_R, q.x, botY, PIPE_W, botH)
        ) {
          endGame();
          break;
        }
      }
    }

    function drawPipe(ctx, x, y, w, h, capTop) {
      var grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, '#40a02b');
      grad.addColorStop(1, '#a6e3a1');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#2e7d22';
      var capH = 12;
      if (capTop) {
        ctx.fillRect(x - 4, h - capH, w + 8, capH);
      } else {
        ctx.fillRect(x - 4, y, w + 8, capH);
      }
    }

    function draw() {
      var ctx = canvas.getContext('2d');

      var sky = ctx.createLinearGradient(0, 0, 0, H - FLOOR_H);
      sky.addColorStop(0, '#89dceb');
      sky.addColorStop(1, '#74c7ec');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H - FLOOR_H);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(70, 74, 20, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(92, 74, 16, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(84, 62, 14, 0, Math.PI * 2); ctx.fill();

      for (var i = 0; i < pipes.length; i++) {
        var p = pipes[i];
        drawPipe(ctx, p.x, 0, PIPE_W, p.gapY, true);
        drawPipe(ctx, p.x, p.gapY + PIPE_GAP, PIPE_W, H - FLOOR_H - (p.gapY + PIPE_GAP), false);
      }

      ctx.fillStyle = '#a6e3a1';
      ctx.fillRect(0, H - FLOOR_H, W, FLOOR_H);
      ctx.fillStyle = '#94d98f';
      for (var gx = 0; gx < W; gx += 24) {
        ctx.fillRect(gx, H - FLOOR_H, 14, 8);
      }

      var tilt = Math.max(-0.6, Math.min(0.7, birdV / 8));
      ctx.save();
      ctx.translate(BIRD_X, birdY);
      ctx.rotate(tilt);
      ctx.fillStyle = '#f9e2af';
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fab387';
      ctx.beginPath();
      ctx.moveTo(BIRD_R - 2, -1);
      ctx.lineTo(BIRD_R + 10, 2);
      ctx.lineTo(BIRD_R - 2, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#11111b';
      ctx.beginPath();
      ctx.arc(3, -4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (!started && !gameOver) {
        ctx.fillStyle = 'rgba(17,17,27,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#cdd6f4';
        ctx.font = '700 26px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Flappy Bird', W / 2, H / 2 - 8);
        ctx.font = '400 13px "JetBrains Mono",monospace';
        ctx.fillText('Press Space or click to start', W / 2, H / 2 + 22);
        ctx.textAlign = 'start';
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(17,17,27,0.62)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f38ba8';
        ctx.font = '700 28px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', W / 2, H / 2 - 12);
        ctx.fillStyle = '#cdd6f4';
        ctx.font = '400 13px "JetBrains Mono",monospace';
        ctx.fillText('Space / Click / Tap to restart', W / 2, H / 2 + 16);
        ctx.textAlign = 'start';
      }
    }

    function loop(ts) {
      if (!running || !document.body.contains(r.win)) {
        running = false;
        return;
      }
      var dtMs = lastTs ? Math.min(ts - lastTs, 40) : 16;
      lastTs = ts;
      update(dtMs);
      draw();
      requestAnimationFrame(loop);
    }

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        return;
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        flap();
      }
    }
    document.addEventListener('keydown', onKey);

    canvas.addEventListener('mousedown', function () { flap(); });
    canvas.addEventListener('touchstart', function (e) {
      e.preventDefault();
      flap();
    }, { passive: false });

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', onKey);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    reset();
    draw();
    requestAnimationFrame(loop);
  }

  window.Site.openFlappyBird = openFlappyBird;

})();