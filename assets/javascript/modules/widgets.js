





window.Site = window.Site || {};

(function () {

var LINKS   = window.Site.LINKS;
var WORK    = window.Site.WORK    || [];
var VOUCHES = window.Site.VOUCHES || [];



function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


function buildSection(title, items) {
  var chips = items.map(function(item) {
    var icon  = esc(item.icon);
    var label = esc(item.label);
    if (item.copy) {
      return '<button class="link-chip" data-copy="'+esc(item.copy)+'" data-label="'+label+'" data-icon="'+icon+'" title="Copy '+esc(item.copy)+'">'+
        '<i class="'+icon+'" aria-hidden="true"></i>'+label+'</button>';
    }
    if (item.switchTab) {
      return '<button class="link-chip" data-switch-tab="'+esc(item.switchTab)+'">'+
        '<i class="'+icon+'" aria-hidden="true"></i>'+label+'</button>';
    }
    var ext = item.href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
    return '<a class="link-chip" href="'+esc(item.href)+'"'+ext+'>'+
      '<i class="'+icon+'" aria-hidden="true"></i>'+label+'</a>';
  }).join('');
  return '<div class="links-section">'+
    '<div class="links-section-title">'+esc(title)+'</div>'+
    '<div class="links-grid">'+chips+'</div>'+
    '</div>';
}

function buildLinksPane() {
  return '<div class="links-banner-wrap"><img class="links-banner" src="https://github.com/TheRealJoelmatic/TheRealJoelmatic/raw/main/img/banner.jpg" alt="Profile banner"></div>' +
         buildSection('Internal', LINKS.internal) +
         buildSection('External', LINKS.external) +
         buildSection('Contact',  LINKS.contact);
}

function buildWorkPane() {
  if (!WORK.length) return '<p class="browser-empty">No projects listed yet.</p>';
  var projectIdx = 0; 
  return WORK.map(function(p) {
    if (p.section) {
      return '<div class="work-section-label">'+esc(p.section)+'</div>';
    }
    var idx  = projectIdx++;
    var tags = p.tags.map(function(t){ return '<span class="work-tag">'+esc(t)+'</span>'; }).join('');
    var inner =
      '<div class="work-card-body">'+
      '<div class="work-card-header">'+
      '<i class="'+esc(p.icon)+' '+esc(p.accent)+'"></i>'+
      '<span class="work-card-name">'+esc(p.name)+'</span>'+
      '</div>'+
      '<p class="work-card-desc">'+esc(p.desc)+'</p>'+
      '<div class="work-card-tags">'+tags+'</div>'+
      '</div>';
    return '<button class="work-card" data-work-idx="'+idx+'">'+inner+'</button>';
  }).join('');
}

function buildVouchesPane() {
  var header =
    '<div class="vouches-header">'+
    '<i class="fa-solid fa-star vouches-star"></i>'+
    '<div>'+
    '<h3 class="vouches-title">Vouches</h3>'+
    '<p class="vouches-count">'+VOUCHES.length+'+ verified reviews from Discord</p>'+
    '</div>'+
    '</div>';

  var grid = '<div class="vouches-grid">';
  grid += VOUCHES.map(function(src, i) {
    return '<button class="vouch-thumb" data-vouch-idx="'+i+'" aria-label="Vouch '+(i+1)+'">'+
      '<img src="'+esc(src)+'" alt="Vouch '+(i+1)+'" loading="lazy">'+
      '</button>';
  }).join('');
  grid += '</div>';

  return header + grid;
}



function attachCopyHandlers(container) {
  container.querySelectorAll('[data-copy]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var value     = btn.dataset.copy;
      var origLabel = btn.dataset.label;
      var origIcon  = btn.dataset.icon;
      if (!navigator.clipboard) { btn.title = value; return; }
      navigator.clipboard.writeText(value).then(function() {
        btn.innerHTML = '<i class="'+origIcon+'" aria-hidden="true"></i>copied!';
        setTimeout(function() {
          btn.innerHTML = '<i class="'+origIcon+'" aria-hidden="true"></i>'+origLabel;
        }, 1500);
      }).catch(function() { btn.title = value; });
    });
  });
}




var PAGES = {
  links:    { label: 'Links',          path: '/',         icon: 'fa-solid fa-link'               },
  work:     { label: 'Work',           path: '/work',     icon: 'fa-solid fa-briefcase'          },
  vouches:  { label: 'Vouches',        path: '/vouches',  icon: 'fa-solid fa-star'               },
  history:  { label: 'History',        path: '/history',  icon: 'fa-solid fa-clock-rotate-left'  },
  settings: { label: 'Settings',       path: '/settings', icon: 'fa-solid fa-gear'               },
  about:    { label: 'About Chromium', path: '/about',    icon: 'fa-brands fa-chrome'            },
};



function buildHistoryPane(log) {
  var header = '<h2 class="browser-page-title"><i class="fa-solid fa-clock-rotate-left"></i> History</h2>';
  if (!log || !log.length) {
    return '<div class="browser-inner-page">' + header + '<p class="browser-empty">No history yet.</p></div>';
  }
  var items = log.slice().reverse().map(function(entry) {
    var page = PAGES[entry.pageId];
    if (!page) return '';
    var t = entry.time;
    var timeStr = t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return '<button class="history-item" data-nav-to="' + esc(entry.pageId) + '">' +
      '<i class="' + esc(page.icon) + '"></i>' +
      '<span class="history-label">' + esc(page.label) + '</span>' +
      '<span class="history-time">' + esc(timeStr) + '</span>' +
      '</button>';
  }).filter(Boolean).join('');
  return '<div class="browser-inner-page">' + header +
    '<div class="history-list">' + items + '</div></div>';
}

function buildSettingsPane() {
  function row(k, v) {
    return '<div class="settings-row"><span class="settings-key">' + k + '</span>' +
      '<span class="settings-val">' + v + '</span></div>';
  }
  function section(title, rows) {
    return '<div class="settings-section"><div class="settings-section-title">' + title + '</div>' + rows + '</div>';
  }
  return '<div class="browser-inner-page">' +
    '<h2 class="browser-page-title"><i class="fa-solid fa-gear"></i> Settings</h2>' +
    section('Appearance',
      row('Theme', 'Catppuccin Mocha') +
      row('Font',  'JetBrains Mono') +
      row('Font size', '13 px')) +
    section('System',
      row('OS',      'Linux x86_64') +
      row('Memory',  '2.1 GB used') +
      row('GPU',     'Mesa Intel® UHD')) +
    '</div>';
}

function buildAboutPane() {
  return '<div class="browser-inner-page browser-about">' +
    '<div class="about-logo"><i class="fa-brands fa-chrome"></i></div>' +
    '<h1 class="about-name">Chromium</h1>' +
    '<p class="about-version">126.0.6478.182 (Official Build) (64-bit)</p>' +
    '<p class="about-tagline">An open-source browser project that aims to build a safer,<br>faster, and more stable way to experience the web.</p>' +
    '<div class="about-grid">' +
      '<div class="about-row"><span class="about-key">OS</span><span class="about-val">Linux x86_64</span></div>' +
      '<div class="about-row"><span class="about-key">JavaScript</span><span class="about-val">V8 12.6.220.25</span></div>' +
      '<div class="about-row"><span class="about-key">WebKit</span><span class="about-val">537.36</span></div>' +
      '<div class="about-row"><span class="about-key">Flash</span><span class="about-val c-red">Not available</span></div>' +
    '</div>' +
    '</div>';
}



function buildChromeSkeleton() {
  return '<div class="browser-chrome">' +
    '<div class="browser-tabbar"></div>' +
    '<div class="browser-addressbar">' +
      '<button class="browser-nav-btn" id="btn-back"     aria-label="Back"    disabled><i class="fa-solid fa-arrow-left"></i></button>' +
      '<button class="browser-nav-btn" id="btn-fwd"      aria-label="Forward" disabled><i class="fa-solid fa-arrow-right"></i></button>' +
      '<button class="browser-nav-btn" id="btn-reload"   aria-label="Reload"><i class="fa-solid fa-rotate-right"></i></button>' +
      '<div class="browser-url">' +
        '<i class="fa-solid fa-lock browser-lock"></i>' +
        '<span class="browser-url-text">localhost:3000</span>' +
      '</div>' +
      '<button class="browser-nav-btn" id="btn-bookmark" aria-label="Bookmark" title="Bookmark"><i class="fa-regular fa-star"></i></button>' +
      '<button class="browser-nav-btn" id="btn-menu"     aria-label="Menu"     title="Menu"><i class="fa-solid fa-ellipsis-vertical"></i></button>' +
    '</div>' +
    '</div>' +
    '<div class="browser-pages"></div>';
}



function buildMenuDropdown() {
  var existing = document.getElementById('browser-menu-dropdown');
  if (existing) return existing;
  var el = document.createElement('div');
  el.id = 'browser-menu-dropdown';
  el.className = 'browser-menu-dropdown';
  el.innerHTML =
    '<button class="browser-menu-item" data-action="new-window"><i class="fa-regular fa-window-restore"></i> New window</button>' +
    '<button class="browser-menu-item" data-action="incognito"><i class="fa-solid fa-user-secret"></i> New incognito window</button>' +
    '<div class="browser-menu-sep"></div>' +
    '<button class="browser-menu-item" data-action="bookmarks"><i class="fa-solid fa-bookmark"></i> Bookmarks</button>' +
    '<button class="browser-menu-item" data-action="history"><i class="fa-solid fa-clock-rotate-left"></i> History</button>' +
    '<button class="browser-menu-item" data-action="downloads"><i class="fa-solid fa-download"></i> Downloads</button>' +
    '<div class="browser-menu-sep"></div>' +
    '<button class="browser-menu-item" data-action="settings"><i class="fa-solid fa-gear"></i> Settings</button>' +
    '<button class="browser-menu-item" data-action="about"><i class="fa-brands fa-chrome"></i> About Chromium</button>';
  document.body.appendChild(el);
  return el;
}



function showToast(msg) {
  if (window.Site.showToast) { window.Site.showToast(msg); return; }
  var t = document.createElement('div');
  t.className = 'waybar-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.classList.add('show'); }, 10);
  setTimeout(function() { t.classList.remove('show'); }, 2200);
  setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
}



function initBrowserWidget() {
  var root = document.getElementById('links-content');
  if (!root) return;

  root.innerHTML = buildChromeSkeleton();

  
  var tabbar      = root.querySelector('.browser-tabbar');
  var pagesEl     = root.querySelector('.browser-pages');
  var urlText     = root.querySelector('.browser-url-text');
  var backBtn     = root.querySelector('#btn-back');
  var fwdBtn      = root.querySelector('#btn-fwd');
  var reloadBtn   = root.querySelector('#btn-reload');
  var bookmarkBtn = root.querySelector('#btn-bookmark');
  var menuBtn     = root.querySelector('#btn-menu');
  var menuDrop    = buildMenuDropdown();

  
  var tabs      = [];   
  var activeUid = null;
  var uidSeq    = 0;
  var navHist   = {};   
  var visitLog  = [];   

  

  function mkUid()  { return ++uidSeq; }

  function activeTab() {
    for (var i = 0; i < tabs.length; i++) { if (tabs[i].uid === activeUid) return tabs[i]; }
    return null;
  }

  function getHist(uid) {
    if (!navHist[uid]) navHist[uid] = { stack: [], idx: -1 };
    return navHist[uid];
  }

  

  function renderTabStrip() {
    var multi = tabs.length > 1;
    tabbar.innerHTML = tabs.map(function(tab) {
      var page = PAGES[tab.pageId] || PAGES.links;
      var cls  = 'browser-tab' + (tab.uid === activeUid ? ' active' : '');
      return '<button class="' + cls + '" data-tab-uid="' + tab.uid + '">' +
        '<i class="' + esc(page.icon) + '"></i>' +
        '<span class="tab-label">' + esc(page.label) + '</span>' +
        (multi ? '<span class="tab-close" data-close-uid="' + tab.uid + '" aria-label="Close tab">&#x2715;</span>' : '') +
        '</button>';
    }).join('') +
    '<button class="browser-tab-new" aria-label="New tab" title="New tab">+</button>';
  }

  
  tabbar.addEventListener('click', function(e) {
    var closeEl = e.target.closest('[data-close-uid]');
    if (closeEl) { e.stopPropagation(); closeTab(parseInt(closeEl.dataset.closeUid, 10)); return; }
    if (e.target.closest('.browser-tab-new')) { openNewTab('links'); return; }
    var tabEl = e.target.closest('[data-tab-uid]');
    if (tabEl) switchToTab(parseInt(tabEl.dataset.tabUid, 10));
  });

  

  function getOrCreatePane(pageId) {
    var pane = pagesEl.querySelector('#pane-' + pageId);
    if (!pane) {
      pane = document.createElement('div');
      pane.className = 'browser-pane';
      pane.id = 'pane-' + pageId;
      pagesEl.appendChild(pane);
    }
    return pane;
  }

  function populatePane(pane, pageId) {
    switch (pageId) {
      case 'links':    pane.innerHTML = buildLinksPane();           attachLinksHandlers(pane);   break;
      case 'work':     pane.innerHTML = buildWorkPane();            attachWorkHandlers(pane);    break;
      case 'vouches':  pane.innerHTML = buildVouchesPane();         attachVouchHandlers(pane);   break;
      case 'history':  pane.innerHTML = buildHistoryPane(visitLog); attachHistoryHandlers(pane); break;
      case 'settings': pane.innerHTML = buildSettingsPane();        break;
      case 'about':    pane.innerHTML = buildAboutPane();           break;
      default:         pane.innerHTML = '<p class="browser-empty">Page not found.</p>';
    }
  }

  function showPagePane(pageId) {
    pagesEl.querySelectorAll('.browser-pane').forEach(function(p) { p.classList.remove('active'); });
    var pane = getOrCreatePane(pageId);
    
    if (pageId === 'history' || !pane.innerHTML.trim()) {
      populatePane(pane, pageId);
    }
    pane.classList.add('active');
    pane.scrollTop = 0;
  }

  

  function attachLinksHandlers(pane) {
    attachCopyHandlers(pane);
    pane.querySelectorAll('[data-switch-tab]').forEach(function(btn) {
      btn.addEventListener('click', function() { navigateTo(btn.dataset.switchTab); });
    });
  }

  function attachWorkHandlers(pane) {
    pane.addEventListener('click', function(e) {
      var card = e.target.closest('[data-work-idx]');
      if (card && window.Site.openWorkModal) window.Site.openWorkModal(parseInt(card.dataset.workIdx, 10));
    });
  }

  function attachVouchHandlers(pane) {
    pane.addEventListener('click', function(e) {
      var thumb = e.target.closest('[data-vouch-idx]');
      if (thumb && window.Site.openVouchLightbox) window.Site.openVouchLightbox(parseInt(thumb.dataset.vouchIdx, 10));
    });
  }

  function attachHistoryHandlers(pane) {
    pane.querySelectorAll('[data-nav-to]').forEach(function(btn) {
      btn.addEventListener('click', function() { navigateTo(btn.dataset.navTo); });
    });
  }

  

  function renderBookmarkBtn(bookmarked) {
    var icon = bookmarkBtn.querySelector('i');
    if (icon) icon.className = bookmarked ? 'fa-solid fa-star' : 'fa-regular fa-star';
    bookmarkBtn.style.color = bookmarked ? 'var(--yellow)' : '';
    bookmarkBtn.title = bookmarked ? 'Bookmarked!' : 'Bookmark';
  }

  function updateAddressBar() {
    var tab = activeTab();
    if (!tab) return;
    var page = PAGES[tab.pageId] || PAGES.links;
    var addrText = 'localhost:3000' + page.path;
    if (urlText) urlText.textContent = addrText;
    renderBookmarkBtn(tab.bookmarked);
    
    var winTitle = 'chromium — ' + addrText;
    if (window.Site.updateFocusedTitle) window.Site.updateFocusedTitle(winTitle);
    
    var winEl = root.closest('.window');
    if (winEl) {
      var titleEl = winEl.querySelector('.window-title-text');
      if (titleEl) titleEl.textContent = winTitle;
    }
  }

  function updateNavButtons() {
    var tab = activeTab();
    if (!tab) return;
    var h = getHist(tab.uid);
    backBtn.disabled = h.idx <= 0;
    fwdBtn.disabled  = h.idx >= h.stack.length - 1;
  }

  
  

  function navigateTo(pageId, opts) {
    if (!PAGES[pageId]) return;
    opts = opts || {};
    var tab = activeTab();
    if (!tab) return;

    tab.pageId = pageId;

    if (!opts.noHistory) {
      var h = getHist(tab.uid);
      h.stack = h.stack.slice(0, h.idx + 1);
      if (h.stack[h.stack.length - 1] !== pageId) {
        h.stack.push(pageId);
        h.idx = h.stack.length - 1;
      }
    }

    
    if (pageId !== 'history') {
      visitLog.push({ pageId: pageId, time: new Date() });
      if (visitLog.length > 100) visitLog = visitLog.slice(-50);
    }

    showPagePane(pageId);
    updateAddressBar();
    updateNavButtons();
    renderTabStrip();
  }

  

  function switchToTab(uid) {
    if (!tabs.some(function(t) { return t.uid === uid; })) return;
    activeUid = uid;
    var tab = activeTab();
    showPagePane(tab.pageId);
    updateAddressBar();
    updateNavButtons();
    renderTabStrip();
  }

  function openNewTab(pageId) {
    pageId = pageId || 'links';
    var id = mkUid();
    tabs.push({ uid: id, pageId: pageId, bookmarked: false });
    navHist[id] = { stack: [pageId], idx: 0 };
    activeUid = id;
    if (pageId !== 'history') visitLog.push({ pageId: pageId, time: new Date() });
    showPagePane(pageId);
    updateAddressBar();
    updateNavButtons();
    renderTabStrip();
  }

  function closeTab(uid) {
    var idx = -1;
    tabs.forEach(function(t, i) { if (t.uid === uid) idx = i; });
    if (idx === -1) return;
    tabs.splice(idx, 1);
    delete navHist[uid];
    if (tabs.length === 0) { openNewTab('links'); return; }
    if (activeUid === uid) {
      switchToTab(tabs[Math.min(idx, tabs.length - 1)].uid);
    } else {
      renderTabStrip();
    }
  }

  

  backBtn.addEventListener('click', function() {
    var tab = activeTab(); if (!tab) return;
    var h = getHist(tab.uid);
    if (h.idx > 0) { h.idx--; navigateTo(h.stack[h.idx], { noHistory: true }); updateNavButtons(); }
  });

  fwdBtn.addEventListener('click', function() {
    var tab = activeTab(); if (!tab) return;
    var h = getHist(tab.uid);
    if (h.idx < h.stack.length - 1) { h.idx++; navigateTo(h.stack[h.idx], { noHistory: true }); updateNavButtons(); }
  });

  reloadBtn.addEventListener('click', function() {
    var icon = reloadBtn.querySelector('i');
    icon.style.transition = 'transform 0.55s ease-in-out';
    icon.style.transform  = 'rotate(360deg)';
    setTimeout(function() { icon.style.transition = 'none'; icon.style.transform = 'rotate(0deg)'; }, 600);
    var tab = activeTab(); if (!tab) return;
    var pane = pagesEl.querySelector('#pane-' + tab.pageId);
    if (pane) { populatePane(pane, tab.pageId); pane.scrollTop = 0; }
  });

  bookmarkBtn.addEventListener('click', function() {
    var tab = activeTab(); if (!tab) return;
    tab.bookmarked = !tab.bookmarked;
    updateAddressBar();
  });

  

  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    var open = menuDrop.classList.toggle('open');
    if (open) {
      var r = menuBtn.getBoundingClientRect();
      menuDrop.style.top  = (r.bottom + 4) + 'px';
      menuDrop.style.left = Math.max(4, r.right - 208) + 'px';
    }
  });

  menuDrop.addEventListener('click', function(e) {
    var item = e.target.closest('[data-action]');
    if (!item) return;
    menuDrop.classList.remove('open');
    switch (item.dataset.action) {
      case 'new-window':  window.open(location.href, '_blank', 'noopener,noreferrer'); break;
      case 'incognito':   showToast('Private browsing is not available');              break;
      case 'bookmarks':   navigateTo('links');                                         break;
      case 'history':     navigateTo('history');                                       break;
      case 'downloads':   showToast('No recent downloads');                            break;
      case 'settings':    navigateTo('settings');                                      break;
      case 'about':       navigateTo('about');                                         break;
    }
  });

  document.addEventListener('click', function() { menuDrop.classList.remove('open'); });

  
  openNewTab('vouches');
  openNewTab('work');
  openNewTab('links');
}

window.Site.initWidgets = function() {
  initBrowserWidget();
};

})(); 
