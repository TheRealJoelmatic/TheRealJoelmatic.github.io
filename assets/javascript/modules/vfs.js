






















window.Site = window.Site || {};

(function () {

  var README_CONTENT = [
    '<p align="center">',
    '  <img src="https://avatars.githubusercontent.com/u/78729990?v=4" alt="Portfolio Screenshot" width="100" style="border-radius: 10px;" />',
    '</p>',
    '',
    '## Info about my portfolio',
    '',
    'This is the source code for my professional portfolio website hosted on',
    '[GitHub Pages](https://pages.github.com/). The website showcases my skills,',
    'projects, and provides a way for visitors to contact me.',
    '',
    '## Live website',
    'You can see the live website in action at [Joelmatic.com](https://Joelmatic.com/).',
    '',
    '## \uD83D\uDCD5 Languages Used',
    '',
    '[![Languages2](https://img.shields.io/badge/-HTML-blue)]()',
    '[![Languages3](https://img.shields.io/badge/-CSS-brightgreen)]()',
    '[![Languages1](https://img.shields.io/badge/-JS-orange)]()',
  ].join('\n');

  var THANKS_CONTENT = [
    '# \u2764\uFE0F  thanks.md',
    '',
    'Hey! Thanks for checking out this repo.',
    '',
    'This portfolio is a fully hand-crafted static site — no frameworks,',
    'no build tools, just HTML, CSS, and vanilla JS simulating a Hyprland desktop.',
    '',
    'If you enjoyed it or found it useful, a star on GitHub goes a long way:',
    '',
    '  https://github.com/TheRealJoelmatic/TheRealJoelmatic.github.io',
    '',
    'Made with \u2615 and way too many late nights by @TheRealJoelmatic.',
  ].join('\n');

  var KEYBINDS_CONTENT = [
    '# \u2328\uFE0F  keybinds.md',
    '',
    '## General',
    '',
    '| Shift + Enter | Open terminal               |',
    '| Shift + Q     | Close window                |',
    '| Shift + R     | Open launcher (rofi)        |',
    '| Shift + F     | Toggle fullscreen           |',
    '| Dbl-click bar | Toggle fullscreen           |',
    '',
    '## Focus',
    '',
    '| Shift + W     | Terminal (ghostty)          |',
    '| Shift + B     | Browser (chromium)          |',
    '| Shift + P     | Pipes screensaver           |',
    '| Shift + J     | Cycle windows forward       |',
    '| Shift + K     | Cycle windows backward      |',
    '',
    '## Snap',
    '',
    '| Shift + \u2190     | Left half                   |',
    '| Shift + \u2192     | Right half                  |',
    '| Shift + \u2191     | Top half                    |',
    '| Shift + \u2193     | Bottom half                 |',
  ].join('\n');

  var HELP_CONTENT = [
    '# 💻  help.md',
    '',
    '## Commands',
    '',
    '| fastfetch          | display about info                          |',
    '| neofetch           | alias for fastfetch                         |',
    '| ls [-la] [path]    | list files                                  |',
    '| cat \u003cfile\u003e          | read a file                                 |',
    '| touch \u003cfile\u003e        | create empty file                           |',
    '| mkdir \u003cdir\u003e         | create directory                            |',
    '| rm \u003cfile\u003e           | remove file                                 |',
    '| rmdir \u003cdir\u003e         | remove empty directory                      |',
    '| mv \u003csrc\u003e \u003cdst\u003e       | move / rename                               |',
    '| cp \u003csrc\u003e \u003cdst\u003e       | copy file or dir                            |',
    '| echo \u003ctext\u003e         | print text (supports > and >>)              |',
    '| cd \u003cpath\u003e           | change directory                            |',
    '| pwd                | print working directory                     |',
    '| whoami             | current user                                |',
    '| uptime             | system uptime                               |',
    '| uname -a           | kernel info                                 |',
    '| git log|status|branch | git info                                 |',
    '| pipes.sh           | animated pipes screensaver (Ctrl+C to exit) |',
    '| kate \u003cfile\u003e         | open file in editor                         |',
    '| vfs reset          | clear saved filesystem (reload to restore)  |',
    '| clear              | clear terminal                              |',
    '| help               | open this file                              |',
  ].join('\n');

  

  var root = {
    type: 'dir',
    children: {
      'home': {
        type: 'dir',
        children: {
          'joel': {
            type: 'dir',
            children: {
              'README.md':   { type: 'file', content: README_CONTENT },
              'thanks.md':   { type: 'file', content: THANKS_CONTENT },
              'keybinds.md': { type: 'file', content: KEYBINDS_CONTENT },
              'help.md':     { type: 'file', content: HELP_CONTENT }
            }
          }
        }
      }
    }
  };

  

  
  function normSegments(path, cwd) {
    var parts;
    if (path.charAt(0) === '/') {
      parts = path.split('/');
    } else {
      parts = cwd.concat(path.split('/'));
    }
    var segs = [];
    parts.forEach(function(p) {
      if (p === '' || p === '.') return;
      if (p === '..') { if (segs.length) segs.pop(); }
      else segs.push(p);
    });
    return segs;
  }

  
  function absPath(path, cwd) {
    var segs = normSegments(path, cwd);
    return '/' + segs.join('/');
  }

  
  function walk(segs) {
    var node = root;
    for (var i = 0; i < segs.length; i++) {
      if (node.type !== 'dir') return null;
      node = node.children[segs[i]];
      if (!node) return null;
    }
    return node;
  }

  
  function resolve(path, cwd) {
    return walk(normSegments(path, cwd));
  }

  
  function resolveParent(path, cwd) {
    var segs = normSegments(path, cwd);
    if (!segs.length) return null; 
    var name   = segs[segs.length - 1];
    var parent = walk(segs.slice(0, -1));
    if (!parent || parent.type !== 'dir') return null;
    return { parent: parent, name: name };
  }

  
  
  
  
  

  var LS_KEY = 'site-vfs-v1';

  
  function flattenFiles(node, prefix) {
    var out = {};
    if (node.type === 'file') {
      out[prefix] = node.content;
    } else {
      Object.keys(node.children).forEach(function(k) {
        var child = flattenFiles(node.children[k], prefix + '/' + k);
        Object.keys(child).forEach(function(p) { out[p] = child[p]; });
      });
    }
    return out;
  }

  
  function persist() {
    try {
      var flat = flattenFiles(root, '');
      localStorage.setItem(LS_KEY, JSON.stringify(flat));
    } catch (e) {  }
  }

  
  (function restoreFromStorage() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      Object.keys(saved).forEach(function(absPath) {
        var segs = absPath.split('/').filter(Boolean);
        if (!segs.length) return;
        var name   = segs[segs.length - 1];
        var parent = walk(segs.slice(0, -1));
        if (parent && parent.type === 'dir') {
          if (parent.children[name] && parent.children[name].type === 'file') {
            
            parent.children[name].content = saved[absPath];
          } else if (!parent.children[name]) {
            
            parent.children[name] = { type: 'file', content: saved[absPath] };
          }
        }
      });
    } catch (e) {  }
  })();



  function deepCopy(node) {
    if (node.type === 'file') return { type: 'file', content: node.content };
    var c = {};
    Object.keys(node.children).forEach(function(k) { c[k] = deepCopy(node.children[k]); });
    return { type: 'dir', children: c };
  }

  

  function ls(path, cwd) {
    var node = resolve(path || '.', cwd);
    if (!node) return null;
    if (node.type === 'file') return [{ name: path, node: node }];
    return Object.keys(node.children).sort().map(function(k) {
      return { name: k, node: node.children[k] };
    });
  }

  function cat(path, cwd) {
    var node = resolve(path, cwd);
    if (!node) return null;
    if (node.type === 'dir') return 'Is a directory';
    return node.content;
  }

  function touch(path, cwd) {
    var p = resolveParent(path, cwd);
    if (!p) return 'No such file or directory';
    if (!p.parent.children[p.name]) {
      p.parent.children[p.name] = { type: 'file', content: '' };
    }
    persist();
    return true;
  }

  function mkdir(path, cwd) {
    var p = resolveParent(path, cwd);
    if (!p) return 'No such file or directory';
    if (p.parent.children[p.name]) return 'File exists';
    p.parent.children[p.name] = { type: 'dir', children: {} };
    persist();
    return true;
  }

  function rm(path, cwd) {
    var p = resolveParent(path, cwd);
    if (!p || !p.parent.children[p.name]) return 'No such file or directory';
    var node = p.parent.children[p.name];
    if (node.type === 'dir') return 'Is a directory (use rmdir or rm -r)';
    delete p.parent.children[p.name];
    persist();
    return true;
  }

  function rmrf(path, cwd) {
    var p = resolveParent(path, cwd);
    if (!p || !p.parent.children[p.name]) return 'No such file or directory';
    delete p.parent.children[p.name];
    persist();
    return true;
  }

  function rmdir(path, cwd) {
    var p = resolveParent(path, cwd);
    if (!p || !p.parent.children[p.name]) return 'No such file or directory';
    var node = p.parent.children[p.name];
    if (node.type !== 'dir') return 'Not a directory';
    if (Object.keys(node.children).length) return 'Directory not empty';
    delete p.parent.children[p.name];
    persist();
    return true;
  }

  function mv(src, dst, cwd) {
    var sp = resolveParent(src, cwd);
    if (!sp || !sp.parent.children[sp.name]) return 'No such file or directory: ' + src;
    var srcNode = sp.parent.children[sp.name];
    var dp = resolveParent(dst, cwd);
    if (!dp) return 'No such file or directory: ' + dst;
    
    var dstNode = dp.parent.children[dp.name];
    if (dstNode && dstNode.type === 'dir') {
      dstNode.children[sp.name] = srcNode;
    } else {
      dp.parent.children[dp.name] = srcNode;
    }
    delete sp.parent.children[sp.name];
    persist();
    return true;
  }

  function cp(src, dst, cwd) {
    var srcNode = resolve(src, cwd);
    if (!srcNode) return 'No such file or directory: ' + src;
    var dp = resolveParent(dst, cwd);
    if (!dp) return 'No such file or directory: ' + dst;
    var dstNode = dp.parent.children[dp.name];
    if (dstNode && dstNode.type === 'dir') {
      var srcBase = src.split('/').pop();
      dstNode.children[srcBase] = deepCopy(srcNode);
    } else {
      dp.parent.children[dp.name] = deepCopy(srcNode);
    }
    persist();
    return true;
  }

  function write(path, content, cwd, append) {
    var p = resolveParent(path, cwd);
    if (!p) return 'No such file or directory';
    var existing = p.parent.children[p.name];
    if (existing && existing.type === 'dir') return 'Is a directory';
    var prev = (append && existing) ? existing.content + '\n' : '';
    p.parent.children[p.name] = { type: 'file', content: prev + content };
    persist();
    return true;
  }

  

  window.Site.vfs = {
    resolve:       resolve,
    resolveParent: resolveParent,
    ls:            ls,
    cat:           cat,
    touch:         touch,
    mkdir:         mkdir,
    rm:            rm,
    rmrf:          rmrf,
    rmdir:         rmdir,
    mv:            mv,
    cp:            cp,
    write:         write,
    absPath:       absPath,
    normSegments:  normSegments,
    save:          persist,
  };

})(); 
