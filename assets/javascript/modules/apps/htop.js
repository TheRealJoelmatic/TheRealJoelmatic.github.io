






window.Site = window.Site || {};

(function () {

  
  var APP_META = {
    'cava-window':      { cmd: 'cava',        baseCpu: 2.4, baseMem: 0.4 },
    'nemo-window':      { cmd: 'nemo',        baseCpu: 0.1, baseMem: 0.9 },
    'nyancat-window':   { cmd: 'nyancat',     baseCpu: 1.8, baseMem: 0.3 },
    'editor-window':    { cmd: 'kate',        baseCpu: 0.2, baseMem: 1.2 },
    'game2048-window':  { cmd: '2048',        baseCpu: 0.4, baseMem: 0.4 },
    'snake-window':     { cmd: 'snake',       baseCpu: 1.2, baseMem: 0.3 },
    'msweeper-window':  { cmd: 'minesweeper', baseCpu: 0.2, baseMem: 0.5 },
    'tetris-window':    { cmd: 'tetris',      baseCpu: 1.0, baseMem: 0.4 },
    'pong-window':      { cmd: 'pong',        baseCpu: 1.6, baseMem: 0.3 },
    'breakout-window':  { cmd: 'breakout',    baseCpu: 1.3, baseMem: 0.4 },
  };

  
  var ID_META = {
    'terminal-fastfetch': { cmd: 'ghostty',  baseCpu: 0.3, baseMem: 1.4 },
    'widget-links':       { cmd: 'chromium', baseCpu: 6.2, baseMem: 3.2 },
    'widget-pipes':       { cmd: 'pipes.sh', baseCpu: 0.9, baseMem: 0.2 },
  };

  
  var SYSTEM = [
    { pid: 1,   cmd: 'systemd',     baseCpu: 0.0, baseMem: 0.1 },
    { pid: 312, cmd: 'dbus-daemon', baseCpu: 0.1, baseMem: 0.3 },
    { pid: 489, cmd: 'hyprland',    baseCpu: 0.7, baseMem: 1.3 },
    { pid: 512, cmd: 'waybar',      baseCpu: 0.4, baseMem: 0.8 },
    { pid: 734, cmd: 'pipewire',    baseCpu: 0.2, baseMem: 0.5 },
    { pid: 850, cmd: 'wireplumber', baseCpu: 0.0, baseMem: 0.3 },
  ];

  var nextPid = 1400;

  function jitter(base) {
    return Math.max(0, base + (Math.random() * 2 - 1) * base * 0.45);
  }

  function openHtop() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-microchip" style="margin-right:6px;color:var(--green)"></i>htop',
      720, 440, 'htop-window'
    );
    if (!r) return;

    r.body.style.cssText = 'padding:0;display:flex;flex-direction:column;background:var(--crust);font-family:"JetBrains Mono",monospace;font-size:13px;overflow:hidden;';

    var statsEl = document.createElement('div');
    statsEl.className = 'htop-stats';
    statsEl.style.cssText = 'padding:10px 14px 6px;border-bottom:1px solid var(--surface0);flex-shrink:0;';
    r.body.appendChild(statsEl);

    var tableWrap = document.createElement('div');
    tableWrap.style.cssText = 'overflow-y:auto;flex:1;';

    var table = document.createElement('table');
    table.className = 'htop-table';
    table.style.width = '100%';
    table.innerHTML =
      '<thead><tr>' +
        '<th style="width:60px">PID</th>' +
        '<th style="width:70px">CPU%</th>' +
        '<th style="width:70px">MEM%</th>' +
        '<th>Command</th>' +
        '<th style="width:50px"></th>' +
      '</tr></thead>';
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    r.body.appendChild(tableWrap);

    function getWinProcs() {
      var wins = document.querySelectorAll('#desktop .window');
      var procs = [];
      for (var i = 0; i < wins.length; i++) {
        var win = wins[i];
        if (win === r.win) continue;

        if (!win._htopPid) win._htopPid = nextPid++;

        var meta = (win.id && ID_META[win.id]) || null;
        if (!meta) {
          for (var cls in APP_META) {
            if (win.classList.contains(cls)) { meta = APP_META[cls]; break; }
          }
        }

        var cmd, baseCpu, baseMem;
        if (meta) {
          cmd = meta.cmd; baseCpu = meta.baseCpu; baseMem = meta.baseMem;
        } else {
          var titleEl = win.querySelector('.window-title-text');
          cmd = titleEl
            ? titleEl.textContent.replace(/[^\x20-\x7E]/g, '').trim().split(/\s+/)[0] || 'window'
            : 'window';
          baseCpu = 0.3; baseMem = 0.5;
        }

        procs.push({ pid: win._htopPid, cmd: cmd, cpu: jitter(baseCpu), mem: jitter(baseMem), win: win });
      }
      return procs;
    }

    function bar(pct, w, col) {
      var n = Math.round(Math.min(pct, 100) / 100 * w);
      return '<span style="color:' + col + '">' + '|'.repeat(n) + '</span>' +
             '<span style="color:var(--surface1)">' + '|'.repeat(w - n) + '</span>';
    }

    function render() {
      var winProcs = getWinProcs();
      var sysProcs = SYSTEM.map(function (s) {
        return { pid: s.pid, cmd: s.cmd, cpu: jitter(s.baseCpu), mem: jitter(s.baseMem), win: null };
      });

      var allProcs = sysProcs.concat(winProcs);
      allProcs.sort(function (a, b) { return b.cpu - a.cpu; });

      var totalCpu = allProcs.reduce(function (s, p) { return s + p.cpu; }, 0);
      var dispCpu  = Math.min(99.9, totalCpu);
      var dispMem  = Math.min(99.9, 16 + winProcs.length * 3.8 + Math.random() * 1.5);
      var now      = new Date();

      statsEl.innerHTML =
        '<div><span class="htop-lbl">CPU</span>[' + bar(dispCpu, 26, 'var(--green)') + ']' +
          ' <span class="htop-val">' + dispCpu.toFixed(1) + '%</span></div>' +
        '<div><span class="htop-lbl">Mem</span>[' + bar(dispMem, 26, 'var(--blue)') + ']' +
          ' <span class="htop-val">' + dispMem.toFixed(1) + '%</span></div>' +
        '<div><span class="htop-lbl">Tasks:</span><span class="htop-val"> ' + allProcs.length + '</span>' +
          '&nbsp;&nbsp;<span class="htop-lbl">Uptime:</span>' +
          '<span class="htop-val"> 3d ' + String(now.getHours()).padStart(2, '0') + ':' +
          String(now.getMinutes()).padStart(2, '0') + '</span></div>';

      tbody.innerHTML = '';
      var esc = window.Site.esc || function (s) { return String(s); };
      allProcs.forEach(function (p) {
        var tr = document.createElement('tr');
        var cpuCol = p.cpu > 5 ? 'var(--red)' : p.cpu > 1 ? 'var(--yellow)' : '';
        if (cpuCol) tr.style.color = cpuCol;

        tr.innerHTML =
          '<td>' + p.pid + '</td>' +
          '<td>' + p.cpu.toFixed(1) + '</td>' +
          '<td>' + p.mem.toFixed(1) + '</td>' +
          '<td>' + esc(p.cmd) + '</td>' +
          '<td>' + (p.win ? '<button class="htop-kill-btn" title="Kill">✕</button>' : '') + '</td>';

        if (p.win) {
          var killBtn = tr.querySelector('.htop-kill-btn');
          (function (win) {
            killBtn.addEventListener('click', function (e) {
              e.stopPropagation();
              if (win.parentNode) {
                if (window.Site.closeWindow) window.Site.closeWindow(win);
                else win.parentNode.removeChild(win);
              }
              render();
            });
          })(p.win);
        }

        tbody.appendChild(tr);
      });
    }

    render();
    var timer = setInterval(render, 2000);

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) { clearInterval(timer); obs.disconnect(); }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  window.Site.openHtop = openHtop;

})();
