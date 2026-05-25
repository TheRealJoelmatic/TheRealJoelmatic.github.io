





window.Site = window.Site || {};

(function () {

  function openCava() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-music" style="margin-right:6px;color:var(--mauve)"></i>cava',
      560, 220, 'cava-window'
    );
    if (!r) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    r.body.style.cssText = 'display:flex;align-items:stretch;padding:0;background:var(--crust);';
    r.body.appendChild(canvas);

    var stopped = false;
    var BARS    = 48;
    var heights = [], targets = [];
    for (var i = 0; i < BARS; i++) { heights.push(0); targets.push(Math.random()); }

    var CSS_COLORS = ['--mauve', '--blue', '--sapphire', '--sky', '--teal', '--green'];

    function resolveColor(varName) {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(varName).trim() || '#cba6f7';
    }

    function frame() {
      if (stopped) return;
      var W = canvas.offsetWidth, H = canvas.offsetHeight;
      if (!W || !H) { requestAnimationFrame(frame); return; }
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      var bw = W / BARS;
      for (var j = 0; j < BARS; j++) {
        targets[j] += (Math.random() - 0.48) * 0.15;
        if (targets[j] < 0)  targets[j] = 0.02;
        if (targets[j] > 1)  targets[j] = 0.95;
        heights[j] += (targets[j] - heights[j]) * 0.18;
        var bh  = heights[j] * H * 0.9;
        var col = CSS_COLORS[Math.floor(j / BARS * CSS_COLORS.length)];
        ctx.fillStyle = resolveColor(col);
        ctx.fillRect(j * bw + 1, H - bh, bw - 2, bh);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    
    var observer = new MutationObserver(function () {
      if (!document.body.contains(r.win)) { stopped = true; observer.disconnect(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.Site.openCava = openCava;

})();
