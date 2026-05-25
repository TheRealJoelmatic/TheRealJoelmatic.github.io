




window.Site = window.Site || {};

(function () {

var timeEl      = document.getElementById('time-display');
var dateEl      = document.getElementById('date-display');
var windowTitle = document.getElementById('window-title');



function updateClock() {
  var now = new Date();
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}



function showToast(msg) {
  var toast = document.createElement('div');
  toast.className = 'waybar-toast';
  toast.innerHTML = '<i class="fa-brands fa-linux"></i> ' + msg;
  document.body.appendChild(toast);
  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() { toast.classList.remove('show'); }, 2200);
  setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 2600);
}

window.Site.showToast = showToast;



window.Site.setWindowTitle = function(text) {
  if (windowTitle) windowTitle.textContent = text || '';
};



function initLauncher() {
  var btn = document.querySelector('.waybar-launcher');
  if (!btn) return;
  btn.addEventListener('click', function() {
    btn.classList.add('launcher-pulse');
    setTimeout(function() { btn.classList.remove('launcher-pulse'); }, 300);
    if (window.Site.openRofi) window.Site.openRofi();
  });
}



function initModuleClicks() {
  var clockEl  = document.getElementById('waybar-clock');
  var wbDateEl = document.getElementById('waybar-date');
  if (clockEl)  { clockEl.style.cursor  = 'pointer'; clockEl.addEventListener('click',  function() { if (window.Site.openCalendar) window.Site.openCalendar(clockEl);  }); }
  if (wbDateEl) { wbDateEl.style.cursor = 'pointer'; wbDateEl.addEventListener('click', function() { if (window.Site.openCalendar) window.Site.openCalendar(wbDateEl); }); }
}



window.Site.initWaybar = function() {
  updateClock();
  setInterval(updateClock, 1000);
  initLauncher();
  initModuleClicks();
};

})(); 
