window.Site = window.Site || {};

(function () {

  function openWordle() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-spell-check" style="margin-right:6px;color:var(--blue)"></i>wordle',
      520, 700, 'wordle-window'
    );
    if (!r) return;

    var WORDS_URL = 'https://raw.githubusercontent.com/dwyl/english-words/refs/heads/master/words.txt';
    var FALLBACK_WORDS = [
      'ABOUT','AFTER','APPLE','BRAIN','BRICK','BRING','CHAIR','CLOUD','CRANE','DREAM',
      'DRIVE','EARTH','FLAME','FRAME','FRESH','GHOST','GLASS','GRASS','GREEN','HEART',
      'HOUSE','JUICE','KNIFE','LIGHT','MANGO','METAL','MIGHT','MOUSE','NERVE','NIGHT',
      'OCEAN','PEACH','PHONE','PLANT','PLATE','POINT','POWER','PRIDE','QUEEN','QUIET',
      'RADIO','RIVER','ROBOT','ROUND','SHARE','SHEEP','SHINE','SKILL','SMILE','SOUND',
      'SPACE','SPARK','SPEED','SPORE','STONE','STORM','SUGAR','TABLE','THEME','THING',
      'THINK','THORN','TIGER','TOWER','TRACK','TRAIN','TRUST','UNITY','VALUE','WATER',
      'WHALE','WORLD','YOUTH'
    ];
    var WORDS = FALLBACK_WORDS.slice();
    var WORD_SET = {};

    var MAX_ROWS = 6;
    var WORD_LEN = 5;

    var answer = '';
    var guesses = [];
    var current = '';
    var finished = false;
    var won = false;
    var keyState = {};

    var KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ENTERZXCVBNMBACK'];

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:12px;display:flex;flex-direction:column;align-items:center;gap:10px;background:var(--base);overflow:hidden;';

    var title = document.createElement('div');
    title.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:18px;font-weight:700;color:var(--text);letter-spacing:2px;';
    title.textContent = 'WORDLE';
    r.body.appendChild(title);

    var status = document.createElement('div');
    status.style.cssText = 'min-height:18px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--subtext0);';
    r.body.appendChild(status);

    var grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(5,52px);grid-template-rows:repeat(6,52px);gap:6px;';
    r.body.appendChild(grid);

    var kb = document.createElement('div');
    kb.style.cssText = 'display:flex;flex-direction:column;gap:6px;width:100%;max-width:440px;';
    r.body.appendChild(kb);

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:4px;';
    var newBtn = document.createElement('button');
    newBtn.className = 'g2048-btn';
    newBtn.textContent = 'New word';
    btnRow.appendChild(newBtn);
    r.body.appendChild(btnRow);

    function setStatus(msg, color) {
      status.textContent = msg || '';
      status.style.color = color || 'var(--subtext0)';
    }

    function rebuildWordSet() {
      WORD_SET = {};
      for (var i = 0; i < WORDS.length; i++) {
        WORD_SET[WORDS[i]] = true;
      }
    }

    function parseExternalWords(raw) {
      var lines = String(raw || '').split(/\r?\n/);
      var seen = {};
      var out = [];
      for (var i = 0; i < lines.length; i++) {
        var w = lines[i].trim().toUpperCase();
        if (!/^[A-Z]{5}$/.test(w)) continue;
        if (seen[w]) continue;
        seen[w] = true;
        out.push(w);
      }
      return out;
    }

    function loadExternalWordList() {
      setStatus('Loading word list...', 'var(--blue)');
      return fetch(WORDS_URL, { cache: 'no-store' })
        .then(function (res) {
          if (!res.ok) throw new Error('Failed to fetch words');
          return res.text();
        })
        .then(function (txt) {
          var parsed = parseExternalWords(txt);
          if (!parsed.length) throw new Error('No 5-letter words found');
          WORDS = parsed;
          rebuildWordSet();
          restart();
          setStatus('Loaded ' + WORDS.length + ' words from dwyl list', 'var(--green)');
        })
        .catch(function () {
          WORDS = FALLBACK_WORDS.slice();
          rebuildWordSet();
          restart();
          setStatus('Using fallback word list', 'var(--peach)');
        });
    }

    function scoreForKey(prev, next) {
      var rank = { absent: 1, present: 2, correct: 3 };
      if (!prev) return next;
      return rank[next] > rank[prev] ? next : prev;
    }

    function evaluateGuess(guess, target) {
      var out = [];
      var used = [false, false, false, false, false];
      var i;

      for (i = 0; i < WORD_LEN; i++) {
        if (guess[i] === target[i]) {
          out[i] = 'correct';
          used[i] = true;
        }
      }

      for (i = 0; i < WORD_LEN; i++) {
        if (out[i]) continue;
        var found = -1;
        for (var j = 0; j < WORD_LEN; j++) {
          if (!used[j] && guess[i] === target[j]) {
            found = j;
            break;
          }
        }
        if (found !== -1) {
          used[found] = true;
          out[i] = 'present';
        } else {
          out[i] = 'absent';
        }
      }

      return out;
    }

    function renderGrid() {
      grid.innerHTML = '';
      for (var rI = 0; rI < MAX_ROWS; rI++) {
        var guess = guesses[rI] ? guesses[rI].word : '';
        var states = guesses[rI] ? guesses[rI].states : null;
        for (var cI = 0; cI < WORD_LEN; cI++) {
          var cell = document.createElement('div');
          cell.style.cssText = 'width:52px;height:52px;border-radius:6px;border:2px solid var(--surface2);display:flex;align-items:center;justify-content:center;font-family:"JetBrains Mono",monospace;font-size:24px;font-weight:700;color:var(--text);text-transform:uppercase;';
          var ch = '';
          if (guess) ch = guess[cI] || '';
          else if (rI === guesses.length) ch = current[cI] || '';
          cell.textContent = ch;

          if (states) {
            if (states[cI] === 'correct') {
              cell.style.background = '#40a02b';
              cell.style.borderColor = '#40a02b';
              cell.style.color = '#f9f6f2';
            } else if (states[cI] === 'present') {
              cell.style.background = '#fab005';
              cell.style.borderColor = '#fab005';
              cell.style.color = '#11111b';
            } else {
              cell.style.background = 'var(--surface0)';
              cell.style.borderColor = 'var(--surface0)';
              cell.style.color = '#f9f6f2';
            }
          } else if (rI === guesses.length && ch) {
            cell.style.borderColor = 'var(--blue)';
          }

          grid.appendChild(cell);
        }
      }
    }

    function renderKeyboard() {
      kb.innerHTML = '';

      KEY_ROWS.forEach(function (rowStr) {
        var rowEl = document.createElement('div');
        rowEl.style.cssText = 'display:flex;gap:6px;justify-content:center;';

        var keys = rowStr === 'ENTERZXCVBNMBACK'
          ? ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
          : rowStr.split('');

        keys.forEach(function (k) {
          var b = document.createElement('button');
          b.className = 'wordle-key';
          b.textContent = k === 'BACK' ? 'BKSP' : k;
          var wide = (k === 'ENTER' || k === 'BACK');
          b.style.cssText =
            'height:42px;' +
            'min-width:' + (wide ? '68px' : '36px') + ';' +
            'padding:0 8px;border:none;border-radius:6px;cursor:pointer;' +
            'font-family:"JetBrains Mono",monospace;font-size:12px;font-weight:700;' +
            'background:var(--surface2);color:var(--text);';

          var s = keyState[k];
          if (s === 'correct') {
            b.style.background = '#40a02b';
            b.style.color = '#f9f6f2';
          } else if (s === 'present') {
            b.style.background = '#fab005';
            b.style.color = '#11111b';
          } else if (s === 'absent') {
            b.style.background = 'var(--surface0)';
            b.style.color = '#cdd6f4';
          }

          b.addEventListener('click', function () {
            onInputKey(k);
          });
          rowEl.appendChild(b);
        });

        kb.appendChild(rowEl);
      });
    }

    function rerender() {
      renderGrid();
      renderKeyboard();
    }

    function commitGuess() {
      if (current.length !== WORD_LEN) {
        setStatus('Not enough letters', 'var(--peach)');
        return;
      }
      if (!WORD_SET[current]) {
        setStatus('Word not in list', 'var(--peach)');
        return;
      }

      var states = evaluateGuess(current, answer);
      guesses.push({ word: current, states: states });

      for (var i = 0; i < WORD_LEN; i++) {
        var ch = current[i];
        keyState[ch] = scoreForKey(keyState[ch], states[i]);
      }

      if (current === answer) {
        finished = true;
        won = true;
        setStatus('Nice. You got it.', 'var(--green)');
      } else if (guesses.length >= MAX_ROWS) {
        finished = true;
        won = false;
        setStatus('Unlucky. Word was ' + answer + '.', 'var(--red)');
      } else {
        setStatus('', 'var(--subtext0)');
      }

      current = '';
      rerender();
    }

    function onInputKey(k) {
      if (!running || finished) {
        if ((k === 'ENTER' || k === 'BACK') && finished) {
          restart();
        }
        return;
      }

      if (k === 'ENTER') {
        commitGuess();
        return;
      }

      if (k === 'BACK') {
        if (current.length) {
          current = current.slice(0, -1);
          rerender();
        }
        return;
      }

      if (/^[A-Z]$/.test(k) && current.length < WORD_LEN) {
        current += k;
        rerender();
      }
    }

    function restart() {
      answer = WORDS[Math.floor(Math.random() * WORDS.length)];
      guesses = [];
      current = '';
      finished = false;
      won = false;
      keyState = {};
      setStatus('Guess the 5-letter word', 'var(--subtext0)');
      rerender();
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

      if (e.key === 'Enter') {
        e.preventDefault();
        onInputKey('ENTER');
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        onInputKey('BACK');
        return;
      }
      var upper = String(e.key || '').toUpperCase();
      if (/^[A-Z]$/.test(upper)) {
        e.preventDefault();
        onInputKey(upper);
      }
    }

    var running = true;
    document.addEventListener('keydown', onKey);

    newBtn.addEventListener('click', restart);

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', onKey);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    rebuildWordSet();
    restart();
    loadExternalWordList();
  }

  window.Site.openWordle = openWordle;

})();
