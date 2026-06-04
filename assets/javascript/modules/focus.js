















window.Site = window.Site || {};

(function () {

  var focusedEl   = null;
  var maximizedEl = null;
  var zCounter    = 200; 

  

  
  function getTitleOf(winEl) {
    var el = winEl.querySelector('.window-title-text');
    return el ? el.textContent.trim() : '';
  }

  function isWindowFocusable(winEl) {
    if (!winEl || !winEl.classList || !winEl.classList.contains('window')) return false;
    if (!document.body.contains(winEl)) return false;
    if (winEl.classList.contains('wm-hidden')) return false;
    if (winEl.getClientRects && winEl.getClientRects().length === 0) return false;
    return true;
  }

  function sanitizeFocused() {
    if (focusedEl && !isWindowFocusable(focusedEl)) {
      focusedEl.classList.remove('focused');
      focusedEl = null;
    }
  }

  function getTopFocusableWindow(excludeEl) {
    var all = document.querySelectorAll('.window');
    var top = null;
    var topZ = -Infinity;
    for (var i = 0; i < all.length; i++) {
      var w = all[i];
      if (excludeEl && w === excludeEl) continue;
      if (!isWindowFocusable(w)) continue;
      var z = parseInt(w.style.zIndex, 10);
      if (isNaN(z)) z = 0;
      if (!top || z >= topZ) {
        top = w;
        topZ = z;
      }
    }
    return top;
  }

  
  function applyFocus(winEl) {
    if (!isWindowFocusable(winEl)) return;

    sanitizeFocused();

    
    if (focusedEl && focusedEl !== winEl) {
      focusedEl.classList.remove('focused');
    }

    focusedEl = winEl;
    winEl.classList.add('focused');

    
    
    
    
    
    zCounter++;
    winEl.style.zIndex = zCounter;
    var par = winEl.parentNode;
    if (par && par.classList &&
        (par.classList.contains('desktop-left') || par.classList.contains('desktop-right'))) {
      par.style.zIndex = zCounter;
    }

    
    if (window.Site.setWindowTitle) {
      window.Site.setWindowTitle(getTitleOf(winEl));
    }
  }

  function clearFocus(winEl) {
    sanitizeFocused();
    if (!focusedEl) return;
    if (winEl && focusedEl !== winEl) return;
    focusedEl.classList.remove('focused');
    focusedEl = null;
    if (window.Site.setWindowTitle) {
      window.Site.setWindowTitle('');
    }
  }

  
  function toggleMaximize(winEl) {
    if (!winEl) return;

    if (winEl.classList.contains('maximized')) {
      
      var saved = winEl._savedPosition;
      if (saved && saved.parent) {
        if (saved.nextSibling) {
          saved.parent.insertBefore(winEl, saved.nextSibling);
        } else {
          saved.parent.appendChild(winEl);
        }
        winEl._savedPosition = null;
      }
      winEl.classList.remove('maximized');
      maximizedEl = null;
    } else {
      
      if (maximizedEl && maximizedEl !== winEl) {
        toggleMaximize(maximizedEl);
      }
      
      winEl._savedPosition = {
        parent: winEl.parentNode,
        nextSibling: winEl.nextSibling || null
      };
      
      document.body.appendChild(winEl);
      winEl.classList.add('maximized');
      maximizedEl = winEl;
      applyFocus(winEl);
    }
  }

  

  
  
  

  function closestWindow(el) {
    while (el && el !== document) {
      if (el.classList && el.classList.contains('window')) return el;
      el = el.parentNode;
    }
    return null;
  }

  function initFocus() {
    document.addEventListener('mousedown', function(e) {
      var win = closestWindow(e.target);
      if (win) applyFocus(win);
    }, true);

    document.addEventListener('focusin', function(e) {
      var win = closestWindow(e.target);
      if (win) applyFocus(win);
    });

    
    var first = getTopFocusableWindow(null);
    if (first) applyFocus(first);
  }

  

  window.Site.focusWindow = function(el) {
    applyFocus(el);
  };

  window.Site.clearFocusWindow = function(el) {
    clearFocus(el || null);
  };

  window.Site.getFocusedWindow = function() {
    sanitizeFocused();
    if (focusedEl) return focusedEl;
    var fallback = getTopFocusableWindow(null);
    if (fallback) applyFocus(fallback);
    return focusedEl;
  };

  window.Site.focusTopWindow = function(excludeEl) {
    var top = getTopFocusableWindow(excludeEl || null);
    if (top) applyFocus(top);
    return top || null;
  };

  window.Site.toggleMaximize = function(el) {
    toggleMaximize(el || focusedEl);
  };

  window.Site.updateFocusedTitle = function(text) {
    if (window.Site.setWindowTitle) {
      window.Site.setWindowTitle(text);
    }
    if (focusedEl) {
      var titleEl = focusedEl.querySelector('.window-title-text');
      if (titleEl) titleEl.textContent = text;
    }
  };

  window.Site.initFocus = function() {
    initFocus();
  };

})(); 
