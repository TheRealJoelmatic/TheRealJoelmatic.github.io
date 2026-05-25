





window.Site = window.Site || {};

(function () {

  var FONT_SIZE    = 14;
  var FONT_FACE    = "'JetBrains Mono', 'Fira Code', monospace";
  var PIPE_COUNT   = 5;
  var STEP_MS      = 80;
  var TURN_CHANCE  = 0.20;
  var MAX_AGE      = 220;
  var CLEAR_EVERY  = 500;
  var TRAIL_ALPHA  = 0.045;
  var BG_COLOR     = '#1e1e2e';

  var COLORS = [
    '#f38ba8', '#a6e3a1', '#f9e2af', '#89b4fa',
    '#cba6f7', '#89dceb', '#94e2d5', '#fab387',
    '#f38ba8', '#cba6f7',
  ];

  var DX = [1, 0, -1, 0];
  var DY = [0, 1,  0, -1];
  var STRAIGHT = ['─', '│', '─', '│'];
  var CORNERS = [
    [null, '╮', null, '╯'],
    ['╰', null,  '╯', null],
    [null, '╭', null, '╰'],
    ['╭', null,  '╮', null],
  ];

  window.Site.startPipes = function (container) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var cols, rows, pipes, animId, tickCount;

    function randColor() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

    function newPipe() {
      var dir = Math.floor(Math.random() * 4);
      return {
        col: Math.floor(Math.random() * cols),
        row: Math.floor(Math.random() * rows),
        dir: dir, prevDir: dir,
        color: randColor(),
        age: 0,
        glowing: Math.random() < 0.3,
      };
    }

    function drawChar(ch, col, row, pipe) {
      var cw = canvas.width  / cols;
      var rh = canvas.height / rows;
      if (pipe.glowing) {
        ctx.shadowColor = pipe.color;
        ctx.shadowBlur  = 8;
      }
      ctx.fillStyle = pipe.color;
      ctx.fillText(ch, col * cw + cw / 2, row * rh + rh / 2);
      ctx.shadowBlur = 0;
    }

    function tick() {
      tickCount++;

      
      ctx.fillStyle = 'rgba(30,30,46,' + TRAIL_ALPHA + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      
      if (tickCount >= CLEAR_EVERY) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        tickCount = 0;
        pipes = [];
        for (var j = 0; j < PIPE_COUNT; j++) pipes.push(newPipe());
        return;
      }

      for (var i = 0; i < pipes.length; i++) {
        var p = pipes[i];
        if (Math.random() < TURN_CHANCE) {
          var perp = (p.dir === 0 || p.dir === 2)
            ? (Math.random() < 0.5 ? 1 : 3)
            : (Math.random() < 0.5 ? 0 : 2);
          p.prevDir = p.dir;
          p.dir = perp;
          var corner = CORNERS[p.prevDir][p.dir];
          if (corner) drawChar(corner, p.col, p.row, p);
        } else {
          drawChar(STRAIGHT[p.dir], p.col, p.row, p);
        }
        p.col = ((p.col + DX[p.dir]) + cols) % cols;
        p.row = ((p.row + DY[p.dir]) + rows) % rows;
        p.prevDir = p.dir;
        p.age++;
        if (p.age >= MAX_AGE) pipes[i] = newPipe();
      }
    }

    function resize() {
      canvas.width  = container.clientWidth  || 200;
      canvas.height = container.clientHeight || 120;
      ctx.font         = FONT_SIZE + 'px ' + FONT_FACE;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      var metrics = ctx.measureText('─');
      cols = Math.max(1, Math.floor(canvas.width  / metrics.width));
      rows = Math.max(1, Math.floor(canvas.height / (FONT_SIZE * 1.2)));
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      tickCount = 0;
      pipes = [];
      for (var i = 0; i < PIPE_COUNT; i++) pipes.push(newPipe());
    }

    resize();
    animId = setInterval(tick, STEP_MS);

    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(function () {
        clearInterval(animId); resize(); animId = setInterval(tick, STEP_MS);
      });
      ro.observe(container);
    } else {
      window.addEventListener('resize', function () {
        clearInterval(animId); resize(); animId = setInterval(tick, STEP_MS);
      });
    }

    return function stop() {
      clearInterval(animId);
      if (ro) ro.disconnect();
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    };
  };

  window.Site.initPipes = function () {};

}());
