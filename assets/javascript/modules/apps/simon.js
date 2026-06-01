window.Site = window.Site || {};

(function () {

  function openSimon() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-hand-pointer" style="margin-right:6px;color:var(--green)"></i>simon says',
      560, 660, 'simon-window'
    );
    if (!r) return;

    var sequence = [];
    var inputIndex = 0;
    var acceptingInput = false;
    var running = true;
    var audioCtx = null;

    var PADS = [
      { id: 0, name: 'Green', color: '#22c55e', tone: 261.63 },
      { id: 1, name: 'Red', color: '#ef4444', tone: 329.63 },
      { id: 2, name: 'Yellow', color: '#f59e0b', tone: 392.0 },
      { id: 3, name: 'Blue', color: '#3b82f6', tone: 523.25 },
    ];

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:12px;display:flex;flex-direction:column;gap:10px;background:var(--base);overflow:hidden;';

    var title = document.createElement('div');
    title.style.cssText = 'text-align:center;font-family:"JetBrains Mono",monospace;font-size:20px;font-weight:700;color:var(--text);';
    title.textContent = 'SIMON SAYS';
    r.body.appendChild(title);

    var status = document.createElement('div');
    status.style.cssText = 'text-align:center;min-height:18px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--subtext0);';
    r.body.appendChild(status);

    var score = document.createElement('div');
    score.style.cssText = 'text-align:center;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--text);';
    r.body.appendChild(score);

    var phase = document.createElement('div');
    phase.style.cssText = 'text-align:center;min-height:18px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--subtext0);';
    r.body.appendChild(phase);

    var board = document.createElement('div');
    board.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:380px;margin:0 auto;width:100%;';
    r.body.appendChild(board);

    var controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:8px;justify-content:center;';
    r.body.appendChild(controls);

    var startBtn = document.createElement('button');
    startBtn.className = 'g2048-btn';
    startBtn.textContent = 'Start';
    controls.appendChild(startBtn);

    var replayBtn = document.createElement('button');
    replayBtn.className = 'g2048-btn';
    replayBtn.textContent = 'Replay';
    controls.appendChild(replayBtn);

    var keyHint = document.createElement('div');
    keyHint.style.cssText = 'text-align:center;font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--subtext0);';
    keyHint.textContent = 'Keys: 1-4 (or Q/W/A/S)';
    r.body.appendChild(keyHint);

    var padEls = [];

    function setStatus(msg, color) {
      status.textContent = msg || '';
      status.style.color = color || 'var(--subtext0)';
    }

    function setPhase(msg, color) {
      phase.textContent = msg || '';
      phase.style.color = color || 'var(--subtext0)';
    }

    function updateScore() {
      score.textContent = 'Round: ' + sequence.length;
    }

    function getAudioCtx() {
      if (!audioCtx) {
        var Ctor = window.AudioContext || window.webkitAudioContext;
        if (Ctor) audioCtx = new Ctor();
      }
      return audioCtx;
    }

    function playTone(freq, durationMs) {
      var ctx = getAudioCtx();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      var now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
      osc.start(now);
      osc.stop(now + durationMs / 1000);
    }

    function flashPad(id, durationMs) {
      var el = padEls[id];
      if (!el) return;
      el.style.filter = 'brightness(1.45) saturate(1.2)';
      el.style.transform = 'scale(0.97)';
      el.style.outline = '3px solid #f9e2af';
      playTone(PADS[id].tone, durationMs);
      setTimeout(function () {
        el.style.filter = '';
        el.style.transform = '';
        el.style.outline = '';
      }, durationMs);
    }

    function showSequence() {
      acceptingInput = false;
      setStatus('Watch closely...', 'var(--yellow)');
      var i = 0;

      function step() {
        if (!running) return;
        if (i >= sequence.length) {
          acceptingInput = true;
          inputIndex = 0;
          setStatus('Your turn', 'var(--green)');
          setPhase('Repeat step 1 of ' + sequence.length, 'var(--green)');
          return;
        }
        setPhase('Simon picks ' + PADS[sequence[i]].name + ' (' + (i + 1) + '/' + sequence.length + ')', 'var(--yellow)');
        flashPad(sequence[i], 320);
        i++;
        setTimeout(step, 500);
      }

      setTimeout(step, 400);
    }

    function startRound() {
      sequence.push(Math.floor(Math.random() * 4));
      updateScore();
      showSequence();
    }

    function resetGame() {
      sequence = [];
      inputIndex = 0;
      acceptingInput = false;
      updateScore();
      setStatus('Memorize the pattern', 'var(--subtext0)');
      setPhase('Watch what Simon chooses', 'var(--subtext0)');
      startRound();
    }

    function onPadInput(id) {
      if (!acceptingInput || !running) return;
      flashPad(id, 180);
      setPhase('You chose ' + PADS[id].name + ' (' + (inputIndex + 1) + '/' + sequence.length + ')', 'var(--text)');

      if (sequence[inputIndex] !== id) {
        acceptingInput = false;
        setStatus('Wrong move. Press Start to retry.', 'var(--red)');
        setPhase('Expected ' + PADS[sequence[inputIndex]].name, 'var(--red)');
        return;
      }

      inputIndex++;
      if (inputIndex >= sequence.length) {
        acceptingInput = false;
        setStatus('Nice. Next round...', 'var(--green)');
        setPhase('Sequence complete', 'var(--green)');
        setTimeout(function () {
          if (running) startRound();
        }, 700);
      } else {
        setPhase('Repeat step ' + (inputIndex + 1) + ' of ' + sequence.length, 'var(--green)');
      }
    }

    PADS.forEach(function (pad) {
      var el = document.createElement('button');
      el.style.cssText =
        'height:150px;border:none;border-radius:12px;cursor:pointer;' +
        'background:' + pad.color + ';box-shadow:inset 0 -10px 0 rgba(0,0,0,0.22);' +
        'transition:transform 120ms ease,filter 120ms ease,box-shadow 120ms ease;' +
        'font-family:"JetBrains Mono",monospace;font-weight:700;font-size:14px;color:#f9f6f2;text-shadow:0 1px 2px rgba(0,0,0,0.4);';
      el.title = pad.name;
      el.innerHTML =
        '<div style="display:flex;flex-direction:column;align-items:center;gap:3px">' +
        '<span style="font-size:16px">' + (pad.id + 1) + '</span>' +
        '<span style="font-size:12px">' + pad.name + '</span>' +
        '</div>';
      el.addEventListener('click', function () { onPadInput(pad.id); });
      board.appendChild(el);
      padEls[pad.id] = el;
    });

    startBtn.addEventListener('click', resetGame);
    replayBtn.addEventListener('click', function () {
      if (!sequence.length) {
        setStatus('Start a game first', 'var(--peach)');
        return;
      }
      showSequence();
    });

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) return;

      var map = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        q: 0,
        w: 1,
        a: 2,
        s: 3,
      };
      var k = String(e.key || '').toLowerCase();
      if (map.hasOwnProperty(k)) {
        e.preventDefault();
        onPadInput(map[k]);
      }
    }

    document.addEventListener('keydown', onKey);

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', onKey);
        if (audioCtx && audioCtx.close) {
          try { audioCtx.close(); } catch (err) {}
        }
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    updateScore();
    setStatus('Press Start', 'var(--subtext0)');
    setPhase('Simon will show a sequence to copy', 'var(--subtext0)');
  }

  window.Site.openSimon = openSimon;

})();
