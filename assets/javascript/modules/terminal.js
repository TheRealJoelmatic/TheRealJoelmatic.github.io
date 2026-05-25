





window.Site = window.Site || {};

(function () {

var _s = window.Site;
var PROFILE      = _s.PROFILE;
var ABOUT_INFO   = _s.ABOUT_INFO;
var ASCII_ART    = _s.ASCII_ART;
var COLOR_PALETTE = _s.COLOR_PALETTE;



function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ffRow(key, val, accent) {
  return '<div class="ff-row">'+
    '<span class="ff-key">'+esc(key)+'</span>'+
    '<span class="ff-sep">: </span>'+
    '<span class="ff-val '+(accent||'')+'">'+esc(val)+'</span>'+
    '</div>';
}

function colorDots() {
  return '<div class="fastfetch-colors">' +
    COLOR_PALETTE.map(function(c){
      return '<span class="color-dot" style="background:'+esc(c)+'" title="'+esc(c)+'"></span>';
    }).join('') + '</div>';
}


function promptSegs(cwd) {
  var u    = esc(PROFILE.user);
  var h    = esc(PROFILE.host);
  var path = cwd && cwd.length ? '~/' + cwd.join('/') : '~';
  return '<span class="p10k-seg p10k-seg-user"><i class="fa-solid fa-user"></i>'+u+'@'+h+'</span>'+
    '<span class="p10k-seg p10k-seg-dir"><i class="fa-solid fa-folder"></i>'+esc(path)+'</span>'+
    '<span class="p10k-seg p10k-seg-git"><i class="fa-solid fa-code-branch"></i>main</span>';
}


function buildFastfetch() {
  var rows = ABOUT_INFO.map(function(r){ return ffRow(r.key,r.val,r.accent); }).join('');
  var u = esc(PROFILE.user), h = esc(PROFILE.host);
  return '<div class="fastfetch-wrapper">'+
    '<pre class="fastfetch-ascii" aria-hidden="true">'+esc(ASCII_ART)+'</pre>'+
    '<div class="fastfetch-info">'+
    '<div class="fastfetch-title"><span class="ff-user">'+u+'</span><span class="ff-at">@</span><span class="ff-host">'+h+'</span></div>'+
    '<hr class="fastfetch-divider" />'+
    rows+
    colorDots()+
    '</div></div>';
}


function createShell(outputEl) {
  var histEl       = null;
  var inputEl      = null;
  var activeLineEl = null;
  var cur          = '';
  var active       = false;
  var cmdHist      = [];
  var histIdx      = -1;
  var pipesOn      = false;
  var pipesStopFn  = null;
  var pipesOverlay = null;
  var cwd          = [];   // [] means /home/joel (home dir)

  function scrollBottom() { outputEl.scrollTop = outputEl.scrollHeight; }

  function addLine(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    histEl.appendChild(d);
    scrollBottom();
  }

  function updateInput() {
    if (activeLineEl) {
      activeLineEl.innerHTML =
        '<div class="terminal-prompt shell-active-prompt">'+
        promptSegs(cwd)+
        ' <span class="shell-input-display"></span>'+
        '<span class="prompt-cursor"></span></div>';
      inputEl = activeLineEl.querySelector('.shell-input-display');
    }
    if (inputEl) inputEl.textContent = cur;
    scrollBottom();
  }


  function stopPipes() {
    if (!pipesOn) return;
    if (pipesStopFn) pipesStopFn();
    pipesOn = false; pipesStopFn = null;
    if (pipesOverlay) { pipesOverlay.remove(); pipesOverlay = null; }
    var win = outputEl.closest ? outputEl.closest('.window') : outputEl.parentElement;
    if (win) win.style.position = '';
    if (activeLineEl) activeLineEl.style.display = '';
    outputEl.focus();
  }

  function startPipes() {
    if (activeLineEl) activeLineEl.style.display = 'none';
    var win = (outputEl.closest ? outputEl.closest('.window') : null) || outputEl.parentElement;
    win.style.position = 'relative';
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;top:30px;left:0;right:0;bottom:0;z-index:10;background:transparent;outline:none;cursor:default;';
    overlay.setAttribute('tabindex', '0');
    win.appendChild(overlay);
    pipesOverlay = overlay;
    pipesOn = true;
    pipesStopFn = window.Site.startPipes(overlay);
    overlay.focus();
    overlay.addEventListener('keydown', handleKey);
    overlay.addEventListener('click', function() { overlay.focus(); });
  }


  var vfs = window.Site.vfs;

  
  var HOME = ['home', PROFILE.user];

  
  function vfsCwd() { return HOME.concat(cwd); }


  function cmdFastfetch() { addLine(buildFastfetch()); }

  function cmdLs(args) {
    var path  = '.';
    var showHidden = false;
    var longFmt    = false;
    args.forEach(function(a) {
      if (a === '-a') { showHidden = true; }
      else if (a === '-l') { longFmt = true; }
      else if (a === '-la' || a === '-al') { showHidden = true; longFmt = true; }
      else if (a.charAt(0) !== '-') { path = a; }
    });
    var entries = vfs.ls(path, vfsCwd());
    if (!entries) {
      addLine('<div class="shell-output-line shell-error">zsh: ls: '+esc(path)+': No such file or directory</div>');
      return;
    }
    var rows = entries.filter(function(e) {
      return showHidden || e.name.charAt(0) !== '.';
    }).map(function(e) {
      var isDir   = e.node.type === 'dir';
      var perm    = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
      var cls     = isDir ? 'c-blue' : (e.name.endsWith('.md') ? 'c-green' : 'c-subtext0');
      var label   = isDir ? e.name + '/' : e.name;
      return '<div class="shell-output-line"><span class="shell-perm">'+esc(perm)+'</span>  <span class="ff-val '+cls+'">'+esc(label)+'</span></div>';
    });
    addLine('<div class="shell-output-block">'+(rows.length ? rows.join('') : '<div class="shell-output-line"><span class="ff-val c-subtext0">(empty)</span></div>')+'</div>');
  }

  function cmdHelp() {
    cmdKate(['help.md']);
  }

  function cmdClear() {
    var ff = outputEl.querySelector('.ff-display');
    if (ff) ff.style.display = 'none';
    histEl.innerHTML = '';
  }

  function cmdWhoami() { addLine('<div class="shell-output-line">'+esc(PROFILE.user)+'</div>'); }

  function cmdPwd() {
    var abs = '/' + HOME.join('/') + (cwd.length ? '/' + cwd.join('/') : '');
    addLine('<div class="shell-output-line">'+esc(abs)+'</div>');
  }

  function cmdUname() {
    addLine('<div class="shell-output-line">Linux '+esc(PROFILE.host)+' 6.9.0-arch1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux</div>');
  }

  function cmdUptime() {
    var now = new Date();
    var hh = String(now.getHours()).padStart(2,'0');
    var mm = String(now.getMinutes()).padStart(2,'0');
    addLine('<div class="shell-output-line"> '+hh+':'+mm+':00 up 3 days, 7:24, 1 user, load average: 0.42, 0.38, 0.31</div>');
  }

  function cmdEcho(args, raw) {
    var gtgt = raw.indexOf('>>');
    var gt   = gtgt === -1 ? raw.indexOf('>') : -1;
    if (gtgt !== -1 || gt !== -1) {
      var sep    = gtgt !== -1 ? '>>' : '>';
      var parts  = raw.split(sep);
      var text   = parts[0].replace(/^echo\s*/i, '').trim();
      var target = (parts[1] || '').trim();
      if (!target) { addLine('<div class="shell-output-line shell-error">zsh: syntax error near unexpected token</div>'); return; }
      var result = vfs.write(target, text, vfsCwd(), gtgt !== -1);
      if (result !== true) {
        addLine('<div class="shell-output-line shell-error">zsh: '+esc(target)+': '+esc(result)+'</div>');
      }
      return;
    }
    addLine('<div class="shell-output-line">'+esc(args.join(' '))+'</div>');
  }

  function cmdKate(args) {
    if (!args.length) { addLine('<div class="shell-output-line shell-error">zsh: kate: missing file operand</div>'); return; }
    var path    = args[0];
    var content = vfs.cat(path, vfsCwd());
    if (content === 'Is a directory') {
      addLine('<div class="shell-output-line shell-error">zsh: kate: '+esc(path)+': Is a directory</div>'); return;
    }
    if (content === null) {
      vfs.touch(path, vfsCwd());
      content = '';
    }
    var filename = path.split('/').pop();
    if (window.Site.openEditor) {
      window.Site.openEditor(filename, content);
    } else {
      addLine('<div class="shell-output-line shell-error">zsh: kate: editor not available</div>');
    }
  }

  function cmdCat(args) {
    if (!args.length) { addLine('<div class="shell-output-line shell-error">zsh: cat: missing file operand</div>'); return; }
    var content = vfs.cat(args[0], vfsCwd());
    if (content === null) {
      addLine('<div class="shell-output-line shell-error">zsh: cat: '+esc(args[0])+': No such file or directory</div>');
    } else if (content === 'Is a directory') {
      addLine('<div class="shell-output-line shell-error">zsh: cat: '+esc(args[0])+': Is a directory</div>');
    } else {
      var lines = content.split('\n');
      var html  = lines.map(function(l) { return '<div class="shell-output-line">'+esc(l)+'</div>'; }).join('');
      addLine('<div class="shell-output-block">'+html+'</div>');
    }
  }

  function cmdTouch(args) {
    if (!args.length) { addLine('<div class="shell-output-line shell-error">zsh: touch: missing operand</div>'); return; }
    var result = vfs.touch(args[0], vfsCwd());
    if (result !== true) addLine('<div class="shell-output-line shell-error">zsh: touch: '+esc(args[0])+': '+esc(result)+'</div>');
  }

  function cmdMkdir(args) {
    if (!args.length) { addLine('<div class="shell-output-line shell-error">zsh: mkdir: missing operand</div>'); return; }
    var result = vfs.mkdir(args[0], vfsCwd());
    if (result !== true) addLine('<div class="shell-output-line shell-error">zsh: mkdir: '+esc(args[0])+': '+esc(result)+'</div>');
  }

  function cmdRm(args) {
    if (!args.length) { addLine('<div class="shell-output-line shell-error">zsh: rm: missing operand</div>'); return; }
    var recursive = false;
    var files = [];
    args.forEach(function(a) {
      if (a === '-r' || a === '-rf' || a === '-fr') recursive = true;
      else files.push(a);
    });
    if (!files.length) { addLine('<div class="shell-output-line shell-error">zsh: rm: missing operand</div>'); return; }
    var fn = recursive ? vfs.rmrf : vfs.rm;
    var result = fn(files[0], vfsCwd());
    if (result !== true) addLine('<div class="shell-output-line shell-error">zsh: rm: '+esc(files[0])+': '+esc(result)+'</div>');
  }

  function cmdRmdir(args) {
    if (!args.length) { addLine('<div class="shell-output-line shell-error">zsh: rmdir: missing operand</div>'); return; }
    var result = vfs.rmdir(args[0], vfsCwd());
    if (result !== true) addLine('<div class="shell-output-line shell-error">zsh: rmdir: '+esc(args[0])+': '+esc(result)+'</div>');
  }

  function cmdMv(args) {
    if (args.length < 2) { addLine('<div class="shell-output-line shell-error">zsh: mv: missing operand</div>'); return; }
    var result = vfs.mv(args[0], args[1], vfsCwd());
    if (result !== true) addLine('<div class="shell-output-line shell-error">zsh: mv: '+esc(result)+'</div>');
  }

  function cmdCp(args) {
    if (args.length < 2) { addLine('<div class="shell-output-line shell-error">zsh: cp: missing operand</div>'); return; }
    var result = vfs.cp(args[0], args[1], vfsCwd());
    if (result !== true) addLine('<div class="shell-output-line shell-error">zsh: cp: '+esc(result)+'</div>');
  }

  function cmdCd(args) {
    var target = (!args || !args.length || args[0] === '~') ? [] : null;
    if (target === null) {
      var newVfsCwd = vfs.normSegments(args[0], vfsCwd());
      var node = vfs.resolve(args[0], vfsCwd());
      if (!node) {
        addLine('<div class="shell-output-line shell-error">zsh: cd: '+esc(args[0])+': No such file or directory</div>');
        return;
      }
      if (node.type !== 'dir') {
        addLine('<div class="shell-output-line shell-error">zsh: cd: '+esc(args[0])+': Not a directory</div>');
        return;
      }
      if (newVfsCwd.length >= HOME.length) {
        var matchHome = HOME.every(function(s, i) { return newVfsCwd[i] === s; });
        if (matchHome) {
          cwd = newVfsCwd.slice(HOME.length);
        } else {
          cwd = newVfsCwd; // outside home; still track it
        }
      } else {
        cwd = newVfsCwd;
      }
    } else {
      cwd = [];
    }
    updateInput();
  }

  function cmdGit(args) {
    var sub = args[0] || '';
    if (sub === 'log') {
      addLine(
        '<div class="shell-output-block">'+
        '<div class="shell-output-line"><span class="ff-val c-yellow">a1b2c3d</span> fix: update fastfetch layout</div>'+
        '<div class="shell-output-line"><span class="ff-val c-yellow">e4f5a6b</span> feat: add interactive terminal shell</div>'+
        '<div class="shell-output-line"><span class="ff-val c-yellow">c7d8e9f</span> feat: pipes.sh screensaver</div>'+
        '<div class="shell-output-line"><span class="ff-val c-yellow">0a1b2c3</span> init: hyprland portfolio site</div>'+
        '</div>'
      );
    } else if (sub === 'status') {
      addLine(
        '<div class="shell-output-block">'+
        '<div class="shell-output-line">On branch <span class="ff-val c-green">main</span></div>'+
        '<div class="shell-output-line">Your branch is up to date with <span class="ff-val c-blue">origin/main</span>.</div>'+
        '<div class="shell-output-line">nothing to commit, working tree clean</div>'+
        '</div>'
      );
    } else if (sub === 'branch') {
      addLine('<div class="shell-output-line">* <span class="ff-val c-green">main</span></div>');
    } else {
      addLine('<div class="shell-output-line shell-error">git: \''+esc(sub)+'\' is not a git command.</div>');
    }
  }

  var CMDS = {
    'fastfetch':  cmdFastfetch,
    'neofetch':   cmdFastfetch,
    'help':       cmdHelp,
    'clear':      cmdClear,
    'pipes.sh':   function() { startPipes(); },
    'whoami':     cmdWhoami,
    'pwd':        cmdPwd,
    'uptime':     cmdUptime,
    'uname':      cmdUname,
    'uname -a':   cmdUname,
  };


  function execute(raw) {
    var cmd   = raw.trim();
    addLine('<div class="terminal-prompt">'+promptSegs(cwd)+' <span class="shell-echo-cmd">'+esc(cmd)+'</span></div>');
    if (!cmd) return;
    var parts = cmd.split(/\s+/);
    var verb  = parts[0].toLowerCase();
    var args  = parts.slice(1);
    var fn    = CMDS[cmd.toLowerCase()];
    if (fn) { fn(args); return; }
    if (verb === 'echo')  { cmdEcho(args, cmd); return; }
    if (verb === 'cat')   { cmdCat(args);  return; }
    if (verb === 'git')   { cmdGit(args);  return; }
    if (verb === 'cd')    { cmdCd(args);   return; }
    if (verb === 'ls')    { cmdLs(args);   return; }
    if (verb === 'touch') { cmdTouch(args); return; }
    if (verb === 'mkdir') { cmdMkdir(args); return; }
    if (verb === 'rm')    { cmdRm(args);   return; }
    if (verb === 'rmdir') { cmdRmdir(args); return; }
    if (verb === 'mv')    { cmdMv(args);   return; }
    if (verb === 'cp')    { cmdCp(args);   return; }
    if (verb === 'kate')  { cmdKate(args); return; }
    if (verb === 'vfs' && args[0] === 'reset') {
      try { localStorage.removeItem('site-vfs-v1'); } catch(e) {}
      addLine('<div class="shell-output-line ff-val c-green">VFS storage cleared. Reload the page to restore defaults.</div>');
      return;
    }
    addLine('<div class="shell-output-line shell-error">zsh: command not found: <span class="ff-val c-red">'+esc(parts[0])+'</span></div>');
  }


  function handleKey(e) {
    if (!active) return;

    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (pipesOn) {
        stopPipes();
        addLine('<div class="terminal-prompt">'+promptSegs(cwd)+' <span class="shell-echo-cmd">pipes.sh</span><span class="ff-val c-red"> ^C</span></div>');
      } else {
        addLine('<div class="terminal-prompt">'+promptSegs(cwd)+' <span class="shell-echo-cmd">'+esc(cur)+'</span><span class="ff-val c-red"> ^C</span></div>');
        cur = ''; updateInput();
      }
      return;
    }

    if (pipesOn) return;

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHist.length - 1) {
        histIdx++;
        cur = cmdHist[cmdHist.length - 1 - histIdx];
        updateInput();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; cur = cmdHist[cmdHist.length - 1 - histIdx]; }
      else { histIdx = -1; cur = ''; }
      updateInput(); return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cur.trim()) { cmdHist.push(cur.trim()); }
      histIdx = -1;
      execute(cur); cur = ''; updateInput(); return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault(); cur = cur.slice(0,-1); updateInput(); return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); cur += e.key; updateInput();
    }
  }


  function init(initialHTML) {
    var ffWrap = document.createElement('div');
    ffWrap.className = 'ff-display';
    ffWrap.innerHTML = (initialHTML !== undefined) ? initialHTML : outputEl.innerHTML;
    outputEl.innerHTML = '';
    outputEl.appendChild(ffWrap);

    histEl = document.createElement('div');
    histEl.className = 'shell-history';
    outputEl.appendChild(histEl);

    activeLineEl = document.createElement('div');
    activeLineEl.innerHTML =
      '<div class="terminal-prompt shell-active-prompt">'+
      promptSegs(cwd)+
      ' <span class="shell-input-display"></span>'+
      '<span class="prompt-cursor"></span></div>';
    outputEl.appendChild(activeLineEl);
    inputEl = activeLineEl.querySelector('.shell-input-display');

    active = true;
    outputEl.setAttribute('tabindex','0');
    outputEl.style.outline = 'none';
    outputEl.focus();
    outputEl.addEventListener('click', function(){ outputEl.focus(); });
    outputEl.addEventListener('keydown', handleKey);
  }

  return { init: init, startPipes: startPipes };
}


function typeCmd(outputEl, cmdStr, onDone) {
  var uid = Math.random().toString(36).slice(2,7);
  outputEl.innerHTML =
    '<div class="terminal-prompt cmd-line">'+
    promptSegs([])+
    ' <span id="tc-'+uid+'" class="cmd-text"></span>'+
    '<span class="prompt-cursor" id="cr-'+uid+'"></span></div>';
  var typedEl  = document.getElementById('tc-'+uid);
  var cursorEl = document.getElementById('cr-'+uid);
  var idx = 0;
  var iv = setInterval(function() {
    if (idx < cmdStr.length) {
      typedEl.textContent += cmdStr[idx++];
    } else {
      clearInterval(iv);
      if (cursorEl) cursorEl.remove();
      setTimeout(onDone, 280);
    }
  }, 75);
}


window.Site.initTerminal = function() {
  var el = document.getElementById('fastfetch-output');
  if (!el) return;
  typeCmd(el, 'fastfetch', function() {
    el.innerHTML = buildFastfetch();
    createShell(el).init();
  });
};

window.Site.initPipesTerminal = function() {
  var el = document.getElementById('pipes-term-output');
  if (!el) return;
  typeCmd(el, 'pipes.sh', function() {
    var shell = createShell(el);
    shell.init('');
    shell.startPipes();
  });
};

})(); // end IIFE
