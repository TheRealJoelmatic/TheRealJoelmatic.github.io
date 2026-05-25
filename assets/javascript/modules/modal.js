






window.Site = window.Site || {};

(function () {

var win = null;
var imgEl, titleEl, descEl, tagsEl, linkEl;


function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ensureDOM() {
  if (win) return;

  win = document.createElement('div');
  win.id = 'work-modal-win';
  win.className = 'window work-modal-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-modal', 'true');

  win.innerHTML =
    '<div class="window-titlebar work-modal-titlebar">'+
      '<span class="window-title-text" id="work-modal-title"></span>'+
      '<button class="work-modal-close" id="work-modal-close" aria-label="Close">\u2715</button>'+
    '</div>'+
    '<div class="window-content work-modal-content">'+
      '<img id="work-modal-img" class="work-modal-img" alt="" loading="lazy">'+
      '<div class="work-modal-body">'+
        '<p id="work-modal-desc" class="work-modal-desc"></p>'+
        '<div id="work-modal-tags" class="work-modal-tags"></div>'+
        '<a id="work-modal-link" class="link-chip work-modal-link" target="_blank" rel="noopener noreferrer">'+
          '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>Open project'+
        '</a>'+
      '</div>'+
    '</div>';

  document.body.appendChild(win);

  imgEl   = document.getElementById('work-modal-img');
  titleEl = document.getElementById('work-modal-title');
  descEl  = document.getElementById('work-modal-desc');
  tagsEl  = document.getElementById('work-modal-tags');
  linkEl  = document.getElementById('work-modal-link');

  document.getElementById('work-modal-close').addEventListener('click', window.Site.closeWorkModal);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && win.classList.contains('open')) {
      window.Site.closeWorkModal();
    }
  });

  attachDrag(win, win.querySelector('.work-modal-titlebar'));
}

function attachDrag(el, handle) {
  var startX, startY, startL, startT, dragging = false;

  handle.addEventListener('mousedown', function(e) {
    if (e.target.closest('.work-modal-close')) return;
    e.preventDefault();
    dragging = true;

    var rect = el.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startL = rect.left;
    startT = rect.top;

    el.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    var newL = startL + dx;
    var newT = startT + dy;

    var maxL = window.innerWidth  - el.offsetWidth;
    var maxT = window.innerHeight - 40; // at least 40px of titlebar visible
    newL = Math.max(0, Math.min(newL, maxL));
    newT = Math.max(0, Math.min(newT, maxT));

    el.style.left = newL + 'px';
    el.style.top  = newT + 'px';
  });

  document.addEventListener('mouseup', function() {
    if (!dragging) return;
    dragging = false;
    el.style.transition = '';
    document.body.style.userSelect = '';
  });
}

function centreWindow() {
  var w = win.offsetWidth  || 440;
  var h = win.offsetHeight || 400;
  win.style.left = Math.max(0, (window.innerWidth  - w) / 2) + 'px';
  win.style.top  = Math.max(0, (window.innerHeight - h) / 2) + 'px';
}

window.Site.openWorkModal = function(idx) {
  var projects = (window.Site.WORK || []).filter(function(p) { return !p.section; });
  var p = projects[idx];
  if (!p) return;

  ensureDOM();

  titleEl.textContent = p.name;
  descEl.textContent  = p.desc;

  if (p.img) {
    imgEl.src = p.img;
    imgEl.style.display = 'block';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }

  tagsEl.innerHTML = p.tags.map(function(t) {
    return '<span class="work-tag">'+esc(t)+'</span>';
  }).join('');

  if (p.url) {
    linkEl.href = p.url;
    linkEl.style.display = 'inline-flex';
  } else {
    linkEl.style.display = 'none';
  }

  win.classList.add('open');
  centreWindow();
  document.getElementById('work-modal-close').focus();
};

window.Site.closeWorkModal = function() {
  if (win) win.classList.remove('open');
};


var vouchWin = null;
var vouchImg, vouchCounter, vouchPrev, vouchNext;
var vouchCurrent = 0;

function ensureVouchDOM() {
  if (vouchWin) return;

  vouchWin = document.createElement('div');
  vouchWin.id = 'vouch-modal-win';
  vouchWin.className = 'window vouch-modal-window';
  vouchWin.setAttribute('role', 'dialog');
  vouchWin.setAttribute('aria-modal', 'true');

  vouchWin.innerHTML =
    '<div class="window-titlebar vouch-modal-titlebar">'+
      '<span class="window-title-text">Vouch — <span id="vouch-modal-counter"></span></span>'+
      '<button class="work-modal-close" id="vouch-modal-close" aria-label="Close">\u2715</button>'+
    '</div>'+
    '<div class="window-content vouch-modal-content">'+
      '<img id="vouch-modal-img" class="vouch-modal-img" alt="">'+
      '<div class="vouch-modal-nav">'+
        '<button class="vouch-nav-btn" id="vouch-prev" aria-label="Previous">'+
          '<i class="fa-solid fa-chevron-left"></i>'+
        '</button>'+
        '<button class="vouch-nav-btn" id="vouch-next" aria-label="Next">'+
          '<i class="fa-solid fa-chevron-right"></i>'+
        '</button>'+
      '</div>'+
    '</div>';

  document.body.appendChild(vouchWin);

  vouchImg     = document.getElementById('vouch-modal-img');
  vouchCounter = document.getElementById('vouch-modal-counter');
  vouchPrev    = document.getElementById('vouch-prev');
  vouchNext    = document.getElementById('vouch-next');

  document.getElementById('vouch-modal-close').addEventListener('click', window.Site.closeVouchLightbox);

  vouchPrev.addEventListener('click', function() { navigateVouch(-1); });
  vouchNext.addEventListener('click', function() { navigateVouch(+1); });

  document.addEventListener('keydown', function(e) {
    if (!vouchWin.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  navigateVouch(-1);
    if (e.key === 'ArrowRight') navigateVouch(+1);
    if (e.key === 'Escape')     window.Site.closeVouchLightbox();
  });

  attachDrag(vouchWin, vouchWin.querySelector('.vouch-modal-titlebar'));
}

function navigateVouch(dir) {
  var vouches = window.Site.VOUCHES || [];
  vouchCurrent = (vouchCurrent + dir + vouches.length) % vouches.length;
  setVouchFrame(vouchCurrent);
}

function setVouchFrame(idx) {
  var vouches = window.Site.VOUCHES || [];
  vouchImg.src = vouches[idx] || '';
  vouchCounter.textContent = (idx + 1) + ' / ' + vouches.length;
}

function centreVouchWindow() {
  var w = vouchWin.offsetWidth  || 520;
  var h = vouchWin.offsetHeight || 440;
  vouchWin.style.left = Math.max(0, (window.innerWidth  - w) / 2) + 'px';
  vouchWin.style.top  = Math.max(0, (window.innerHeight - h) / 2) + 'px';
}

window.Site.openVouchLightbox = function(idx) {
  ensureVouchDOM();
  vouchCurrent = idx || 0;
  setVouchFrame(vouchCurrent);
  vouchWin.classList.add('open');
  centreVouchWindow();
  vouchWin.querySelector('#vouch-modal-close').focus();
};

window.Site.closeVouchLightbox = function() {
  if (vouchWin) vouchWin.classList.remove('open');
};

})(); // end IIFE
