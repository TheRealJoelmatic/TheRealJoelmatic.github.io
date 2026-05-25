




























window.Site = window.Site || {};

(function () {

  

  function getDesktop() { return document.getElementById('desktop'); }

  function getFocused() { return document.querySelector('.window.focused'); }

  function isInput() {
    var t = document.activeElement && document.activeElement.tagName.toLowerCase();
    return t === 'input' || t === 'textarea';
  }

  function isMobile() { return window.innerWidth <= 780; }

  
  
  
  

  var SNAP_ZONE = 32; 

  function getSnapZone(pt, dRect) {
    var x = pt.x - dRect.left;
    var y = pt.y - dRect.top;
    var dw = dRect.width, dh = dRect.height;
    
    if (x < SNAP_ZONE && y < SNAP_ZONE)            return 'topleft';
    if (x > dw - SNAP_ZONE && y < SNAP_ZONE)       return 'topright';
    if (x < SNAP_ZONE && y > dh - SNAP_ZONE)       return 'bottomleft';
    if (x > dw - SNAP_ZONE && y > dh - SNAP_ZONE)  return 'bottomright';
    if (x < SNAP_ZONE)                              return 'left';
    if (x > dw - SNAP_ZONE)                        return 'right';
    if (y < SNAP_ZONE)                              return 'top';
    return null;
  }

  function snapPreviewRect(zone, dw, dh) {
    var hw = Math.round(dw / 2), hh = Math.round(dh / 2);
    switch (zone) {
      case 'left':        return { l: E,        t: E,        w: hw - E - G/2,  h: dh - 2*E      };
      case 'right':       return { l: hw + G/2,  t: E,        w: hw - G/2 - E,  h: dh - 2*E      };
      case 'top':         return { l: E,        t: E,        w: dw - 2*E,      h: dh - 2*E      };
      case 'topleft':     return { l: E,        t: E,        w: hw - E - G/2,  h: hh - E - G/2  };
      case 'topright':    return { l: hw + G/2,  t: E,        w: hw - G/2 - E,  h: hh - E - G/2  };
      case 'bottomleft':  return { l: E,        t: hh + G/2, w: hw - E - G/2,  h: hh - G/2 - E  };
      case 'bottomright': return { l: hw + G/2,  t: hh + G/2, w: hw - G/2 - E,  h: hh - G/2 - E  };
      default:            return null;
    }
  }

  function applySnapZone(win, zone, dw, dh) {
    if (!win.classList.contains('floating')) enterFloat(win);
    if (zone === 'top') {
      
      if (window.Site.toggleMaximize) window.Site.toggleMaximize(win);
      return;
    }
    var r = snapPreviewRect(zone, dw, dh);
    if (r) setRect(win, r);
  }

  function initDrag() {
    var drag = null; 

    
    var preview = null;
    function getPreview() {
      if (!preview) {
        preview = document.createElement('div');
        preview.id = 'wm-snap-preview';
        var desk = getDesktop();
        if (desk) desk.appendChild(preview);
      }
      return preview;
    }
    function showPreview(r) {
      var p = getPreview();
      p.style.left   = r.l + 'px';
      p.style.top    = r.t + 'px';
      p.style.width  = r.w + 'px';
      p.style.height = r.h + 'px';
      p.style.display = 'block';
    }
    function hidePreview() {
      if (preview) preview.style.display = 'none';
    }

    function getXY(e) {
      var src = e.touches ? e.touches[0] : e;
      return { x: src.clientX, y: src.clientY };
    }

    function onStart(e) {
      
      var tb = e.target;
      while (tb && tb !== document) {
        if (tb.classList && tb.classList.contains('window-titlebar')) break;
        tb = tb.parentNode;
      }
      if (!tb || !tb.classList.contains('window-titlebar')) return;
      var win = tb.parentNode;
      if (!win || !win.classList.contains('window')) return;
      if (!win.classList.contains('floating')) return;
      if (win.classList.contains('maximized')) return;
      
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

      var desk  = getDesktop();
      var dRect = desk.getBoundingClientRect();
      var pt    = getXY(e);

      drag = {
        win:      win,
        dRect:    dRect,
        startX:   pt.x,
        startY:   pt.y,
        origLeft: parseInt(win.style.left, 10) || 0,
        origTop:  parseInt(win.style.top,  10) || 0,
        zone:     null,
      };

      if (window.Site.focusWindow) window.Site.focusWindow(win);
      e.preventDefault();
    }

    function onMove(e) {
      if (!drag) return;
      var pt   = getXY(e);
      var dx   = pt.x - drag.startX;
      var dy   = pt.y - drag.startY;
      var desk = drag.dRect;
      var w    = drag.win;

      var newLeft = drag.origLeft + dx;
      var newTop  = drag.origTop  + dy;

      
      var minL = 0, maxL = desk.width  - (parseInt(w.style.width,  10) || 200);
      var minT = 0, maxT = desk.height - 30; 
      newLeft = Math.max(minL, Math.min(maxL, newLeft));
      newTop  = Math.max(minT, Math.min(maxT, newTop));

      w.style.left = newLeft + 'px';
      w.style.top  = newTop  + 'px';

      
      var zone = getSnapZone(pt, desk);
      drag.zone = zone;
      if (zone) {
        var dw = desk.width, dh = desk.height;
        if (zone === 'top') {
          
          showPreview({ l: E, t: E, w: dw - 2*E, h: dh - 2*E });
        } else {
          var r = snapPreviewRect(zone, dw, dh);
          if (r) showPreview(r); else hidePreview();
        }
      } else {
        hidePreview();
      }

      e.preventDefault();
    }

    function onEnd() {
      if (drag && drag.zone) {
        applySnapZone(drag.win, drag.zone, drag.dRect.width, drag.dRect.height);
      }
      hidePreview();
      drag = null;
    }

    
    document.addEventListener('mousedown',  onStart);
    document.addEventListener('mousemove',  onMove);
    document.addEventListener('mouseup',    onEnd);
    
    document.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove',  onMove,  { passive: false });
    document.addEventListener('touchend',   onEnd);
  }

  

  
  function enterFloat(win, rectSnapshot) {
    if (!win) return;
    if (win.classList.contains('floating') || win.classList.contains('maximized')) return;

    var desk  = getDesktop();
    var dRect = desk.getBoundingClientRect();
    var wRect = rectSnapshot || win.getBoundingClientRect();

    
    win._wmFloatSaved = {
      parent:      win.parentNode,
      nextSibling: win.nextSibling || null
    };

    
    win.style.left   = (wRect.left - dRect.left) + 'px';
    win.style.top    = (wRect.top  - dRect.top)  + 'px';
    win.style.width  = wRect.width  + 'px';
    win.style.height = wRect.height + 'px';

    desk.appendChild(win);
    win.classList.add('floating');
  }

  function exitFloat(win) {
    if (!win || !win.classList.contains('floating')) return;

    var saved = win._wmFloatSaved;
    
    win.style.left = win.style.top = win.style.width = win.style.height = '';
    win.classList.remove('floating');

    if (saved && saved.parent) {
      if (saved.nextSibling) saved.parent.insertBefore(win, saved.nextSibling);
      else                   saved.parent.appendChild(win);
      win._wmFloatSaved = null;
    }
  }

  function toggleFloat(win) {
    if (!win) return;
    if (win.classList.contains('maximized')) return; 
    if (win.classList.contains('floating'))  exitFloat(win);
    else                                     enterFloat(win);
  }

  

  
  function closeWindow(win) {
    if (!win) return;
    if (win.classList.contains('maximized') && window.Site.toggleMaximize) {
      window.Site.toggleMaximize(win);
    }
    if (win.classList.contains('floating')) exitFloat(win);

    
    if (win.classList.contains('editor-window')) {
      if (win.parentNode) win.parentNode.removeChild(win);
      reflowWindows();
      return;
    }

    
    win.classList.add('wm-hidden');
    if (window.Site.showToast) {
      window.Site.showToast('Closed — reopen from launcher (Shift+R)');
    }
    
    reflowWindows();
  }

  
  function openWindow(winRef) {
    var win = (typeof winRef === 'string')
      ? document.getElementById(winRef)
      : winRef;
    if (!win) return;
    win.classList.remove('wm-hidden');
    if (window.Site.focusWindow) window.Site.focusWindow(win);
  }

  
  
  
  

  function snapWindow(win, direction) {
    if (!win || win.classList.contains('maximized')) return;
    
    if (isMobile()) { openWindow(win); return; }

    var desk  = getDesktop();
    var dRect = desk.getBoundingClientRect();
    var dw = dRect.width,  dh = dRect.height;
    var hw = Math.round(dw / 2), hh = Math.round(dh / 2);

    
    var visible = WIN_IDS
      .map(function(id) { return document.getElementById(id); })
      .filter(function(w) { return w && !w.classList.contains('wm-hidden'); });

    visible.forEach(function(w) {
      if (!w.classList.contains('floating')) enterFloat(w);
    });

    
    var masterSpec = {
      left:  { l: E,        t: E, w: hw - E - G/2, h: dh - 2*E },
      right: { l: hw + G/2, t: E, w: hw - G/2 - E, h: dh - 2*E },
      up:    { l: E,        t: E, w: dw - 2*E,       h: hh - E - G/2 },
      down:  { l: E,        t: hh + G/2, w: dw - 2*E, h: hh - G/2 - E }
    }[direction];
    if (!masterSpec) return;

    setRect(win, masterSpec);

    
    var others = visible.filter(function(w) { return w !== win; });
    if (!others.length) return;

    var vert = (direction === 'left' || direction === 'right');
    var n    = others.length;

    if (vert) {
      
      var ox = (direction === 'left') ? hw + G/2 : E;
      var ow = hw - G/2 - E;
      var availH = dh - 2*E;
      var segH = Math.round((availH - G * (n - 1)) / n);
      others.forEach(function(w, i) {
        setRect(w, { l: ox, t: E + i * (segH + G), w: ow, h: segH });
      });
    } else {
      
      var oy = (direction === 'up') ? hh + G/2 : E;
      var oh = hh - G/2 - E;
      var availW = dw - 2*E;
      var segW = Math.round((availW - G * (n - 1)) / n);
      others.forEach(function(w, i) {
        setRect(w, { l: E + i * (segW + G), t: oy, w: segW, h: oh });
      });
    }

    if (window.Site.focusWindow) window.Site.focusWindow(win);
  }

  var E = 6; 
  var G = 6; 

  function setRect(win, spec) {
    win.style.left   = spec.l + 'px';
    win.style.top    = spec.t + 'px';
    win.style.width  = spec.w + 'px';
    win.style.height = spec.h + 'px';
  }

  
  
  

  var WIN_IDS = ['terminal-fastfetch', 'widget-links', 'widget-pipes'];

  function reflowWindows() {
    var desk = getDesktop();
    if (!desk) return;
    var visible = WIN_IDS
      .map(function(id) { return document.getElementById(id); })
      .filter(function(w) { return w && !w.classList.contains('wm-hidden'); });
    if (!visible.length) return;
    
    if (isMobile()) {
      visible.forEach(function(w) {
        if (w.classList.contains('floating') && !w.classList.contains('maximized')) exitFloat(w);
      });
      return;
    }
    var dRect = desk.getBoundingClientRect();
    var dw = dRect.width, dh = dRect.height;
    
    visible.forEach(function(w) {
      if (!w.classList.contains('floating') && !w.classList.contains('maximized')) enterFloat(w);
    });
    var n = visible.length;
    if (n === 1) {
      setRect(visible[0], { l: E, t: E, w: dw - 2*E, h: dh - 2*E });
    } else {
      
      var hw = Math.round(dw / 2);
      setRect(visible[0], { l: E, t: E, w: hw - E - G/2, h: dh - 2*E });
      var others = visible.slice(1);
      var availH = dh - 2*E;
      var segH = Math.round((availH - G * (others.length - 1)) / others.length);
      others.forEach(function(w, i) {
        setRect(w, { l: hw + G/2, t: E + i * (segH + G), w: hw - G/2 - E, h: segH });
      });
    }
  }

  

  function cycleFocus(reverse) {
    var visible = WIN_IDS
      .map(function (id) { return document.getElementById(id); })
      .filter(function (w) { return w && !w.classList.contains('wm-hidden'); });
    if (visible.length < 2) return;

    var cur = getFocused();
    var idx = visible.indexOf(cur);
    var next;
    if (reverse) {
      next = visible[(idx - 1 + visible.length) % visible.length];
    } else {
      next = visible[(idx + 1) % visible.length];
    }
    if (window.Site.focusWindow) window.Site.focusWindow(next);
  }

  
  
  
  

  function initKeybinds() {
    document.addEventListener('keydown', function (e) {
      if (isInput()) return;

      var shift   = e.shiftKey;
      var focused = getFocused();

      
      if (shift && e.key === 'Enter') {
        e.preventDefault(); openWindow('terminal-fastfetch'); return;
      }
      
      if (shift && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault(); closeWindow(focused); return;
      }
      
      if (shift && (e.key === 'r' || e.key === 'R')) {
        e.preventDefault();
        if (window.Site.openRofi) window.Site.openRofi();
        return;
      }
      
      if (shift && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (window.Site.toggleMaximize) window.Site.toggleMaximize(focused);
        return;
      }
      
      if (shift && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault(); openWindow('terminal-fastfetch'); return;
      }
      
      if (shift && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault(); openWindow('widget-links'); return;
      }
      
      if (shift && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault(); openWindow('widget-pipes'); return;
      }
      
      if (shift && (e.key === 'j' || e.key === 'J')) {
        e.preventDefault(); cycleFocus(false); return;
      }
      
      if (shift && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault(); cycleFocus(true); return;
      }
      
      if (shift && e.key === 'ArrowLeft')  { e.preventDefault(); snapWindow(focused, 'left');  return; }
      if (shift && e.key === 'ArrowRight') { e.preventDefault(); snapWindow(focused, 'right'); return; }
      if (shift && e.key === 'ArrowUp')    { e.preventDefault(); snapWindow(focused, 'up');    return; }
      if (shift && e.key === 'ArrowDown')  { e.preventDefault(); snapWindow(focused, 'down');  return; }
    });
  }

  

  function initWM() {
    initDrag();
    
    document.addEventListener('dblclick', function(e) {
      var el = e.target;
      while (el && el !== document) {
        if (el.classList && el.classList.contains('window-titlebar')) {
          var win = el.parentNode;
          if (win && win.classList.contains('window')) {
            e.preventDefault();
            if (window.Site.toggleMaximize) window.Site.toggleMaximize(win);
          }
          return;
        }
        el = el.parentNode;
      }
    });
    initKeybinds();
  }

  

  window.Site.openWindow  = openWindow;
  window.Site.closeWindow = closeWindow;
  window.Site.snapWindow  = snapWindow;

  window.Site.initWM = function () { initWM(); };

})(); 
