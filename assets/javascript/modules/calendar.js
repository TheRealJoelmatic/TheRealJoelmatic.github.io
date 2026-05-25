





window.Site = window.Site || {};

(function () {

var MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
var DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

var calEl     = null;
var calYear   = 0;
var calMonth  = 0;
var calSelDay = null;



function buildHTML(year, month, selDay) {
  var now         = new Date();
  var firstDay    = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();

  var html =
    '<div class="cal-header">' +
      '<button class="cal-nav" data-dir="-1"><i class="fa-solid fa-chevron-left"></i></button>' +
      '<span class="cal-month-title">' + MONTH_NAMES[month] + ' ' + year + '</span>' +
      '<button class="cal-nav" data-dir="1"><i class="fa-solid fa-chevron-right"></i></button>' +
    '</div>' +
    '<div class="cal-grid">';

  DAY_NAMES.forEach(function(d) { html += '<div class="cal-day-name">' + d + '</div>'; });

  for (var i = 0; i < firstDay; i++) html += '<div class="cal-cell cal-empty"></div>';

  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    var isSel   = d === selDay && !isToday;
    var cls = 'cal-cell' + (isToday ? ' cal-today' : '') + (isSel ? ' cal-selected' : '');
    html += '<div class="' + cls + '" data-day="' + d + '">' + d + '</div>';
  }

  html += '</div>';

  
  var showDay  = selDay || (month === now.getMonth() && year === now.getFullYear() ? now.getDate() : 1);
  var detail   = new Date(year, month, showDay)
    .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  html += '<div class="cal-detail">' + detail + '</div>';

  return html;
}



function render() {
  if (!calEl) return;
  calEl.innerHTML = buildHTML(calYear, calMonth, calSelDay);

  calEl.querySelectorAll('.cal-nav').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      calSelDay = null;
      calMonth += parseInt(btn.getAttribute('data-dir'), 10);
      if (calMonth > 11) { calMonth = 0;  calYear++; }
      if (calMonth < 0)  { calMonth = 11; calYear--; }
      render();
    });
  });

  calEl.querySelectorAll('.cal-cell:not(.cal-empty)').forEach(function(cell) {
    cell.addEventListener('click', function(e) {
      e.stopPropagation();
      calSelDay = parseInt(cell.getAttribute('data-day'), 10);
      render();
    });
  });
}



function closeCalendar() {
  if (!calEl) return;
  calEl.classList.remove('cal-show');
  var el = calEl;
  calEl = null;
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 180);
}



window.Site.openCalendar = function(anchorEl) {
  if (calEl) { closeCalendar(); return; }

  var now  = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();
  calSelDay = null;

  calEl = document.createElement('div');
  calEl.className = 'waybar-calendar';
  render();
  document.body.appendChild(calEl);

  var rect = anchorEl.getBoundingClientRect();
  calEl.style.top   = (rect.bottom + 6) + 'px';
  calEl.style.right = (window.innerWidth - rect.right) + 'px';

  setTimeout(function() { calEl.classList.add('cal-show'); }, 10);

  function onOutside(e) {
    if (calEl && !calEl.contains(e.target) && e.target !== anchorEl) {
      closeCalendar();
      document.removeEventListener('mousedown', onOutside);
    }
  }
  setTimeout(function() { document.addEventListener('mousedown', onOutside); }, 50);
};

})(); 
