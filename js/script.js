var IsMoblie;

document.addEventListener('DOMContentLoaded', function() {
    // Get the navbar element
    const navbar = document.getElementById('navbar');
  
    if (window.innerWidth > 1008) {

   IsMoblie = false;
    // Add event listeners to the document to track mouse movements
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
  
    // Function to show the navbar when mouse is near
    function handleMouseMove(event) {
      // Define the threshold distance (in pixels) when the navbar should appear
      const thresholdDistance = 50;
  
      // Calculate the distance from the mouse to the navbar
      const rect = navbar.getBoundingClientRect();
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const distanceX = Math.min(Math.abs(rect.left - mouseX), Math.abs(rect.right - mouseX));
      const distanceY = Math.min(Math.abs(rect.top - mouseY), Math.abs(rect.bottom - mouseY));
      const distance = Math.min(distanceX, distanceY);
  
      // Show the navbar with a smooth fade-in if the distance is within the threshold
      if (distance <= thresholdDistance) {
        navbar.style.opacity = '1'; // Set opacity to 1 to show the navbar
      } else {
        navbar.style.opacity = '0'; // Set opacity to 0 to hide the navbar
      }
    }
  
    // Function to keep the navbar visible when the mouse is over it
    function handleMouseOver(event) {
      // Show the navbar when the mouse is over it
      navbar.style.opacity = '1';
    }
  
    // Function to hide the navbar when the mouse leaves it
    navbar.addEventListener('mouseleave', () => {
      navbar.style.opacity = '0';

    });
   }
   else{
      navbar.style.opacity = '1';
      IsMoblie = true;
      console.log("Tiney screen")
   }
  });
  

function changeToAbout() {
    console.log("changeToAbout");
    var aboutDivElement = document.getElementById('about');
    aboutDivElement.classList.add('startSlide');
    aboutDivElement.classList.remove('disabled-div');
    setTimeout(function() {
        window.location.href = 'about.html';
    },500);
    // You can add any other code you want to execute when the button is pressed here.
}
function changeToMain() {
    console.log("changeToMain");
    var mainDivElement = document.getElementById('main');
    mainDivElement.classList.add('slide-in-left');
    mainDivElement.classList.remove('disabled-div');
    setTimeout(function() {
        window.location.href = 'index.html';
    },500);
    // You can add any other code you want to execute when the button is pressed here.
}
function changeToWork() {
    console.log("changeToWork");
    var workDivElement = document.getElementById('work');
    workDivElement.classList.add('slide-in-left');
    workDivElement.classList.remove('disabled-div');
    setTimeout(function() {
        window.location.href = 'work.html';
    },500);
    // You can add any other code you want to execute when the button is pressed here.
}
function changeToContact() {
   console.log("changeToContact");
   var workDivElement = document.getElementById('contact');
   workDivElement.classList.add('startSlide');
   workDivElement.classList.remove('disabled-div');
   setTimeout(function() {
       window.location.href = 'contact.html';
   },500);
   // You can add any other code you want to execute when the button is pressed here.
}

function changeToTab(tab) {
    var tab1 = document.getElementById('tab1');
    var tab2 = document.getElementById('tab2');

    var tabButton1 = document.getElementById('tabButton1');
    var tabButton2 = document.getElementById('tabButton2');

    var card1 = document.getElementById('card1');
    var card2 = document.getElementById('card2');
    var card3 = document.getElementById('card3');
    var card4 = document.getElementById('card4');

    var card5 = document.getElementById('card5');
    var card6 = document.getElementById('card6');
    var card7 = document.getElementById('card7');
    var card8 = document.getElementById('card8');

    tab1.classList.remove('slideDown');
    tab2.classList.remove('slideDown');
    
    card1.classList.remove('slideDown');
    card2.classList.remove('slideDown2');
    card3.classList.remove('slideDown3');
    card4.classList.remove('slideDown4');
    card5.classList.remove('slideDown');
    card6.classList.remove('slideDown2');
    card7.classList.remove('slideDown3');
    card8.classList.remove('slideDown4');

    tab1.classList.remove('slideUp');
    tab2.classList.remove('slideUp');

    card1.classList.remove('slideUp');
    card2.classList.remove('slideUp2');
    card3.classList.remove('slideUp3');
    card4.classList.remove('slideUp4');
    card5.classList.remove('slideUp');
    card6.classList.remove('slideUp2');
    card7.classList.remove('slideUp3');
    card8.classList.remove('slideUp4');

    tabButton1.classList.remove('tab-active');
    tabButton2.classList.remove('tab-active');


    if (tab == 2) {
      if(IsMoblie == true){
         tab2.classList.remove('disabled-div');
         tab1.classList.add('disabled-div');
         tabButton2.classList.add('tab-active');
         return;
      }

        tabButton2.classList.add('tab-active');

        tab1.classList.add('slideDown');

        card1.classList.add('slideDown');
        card2.classList.add('slideDown2');
        card3.classList.add('slideDown3');
        card4.classList.add('slideDown4');

        setTimeout(function() {
            tab2.classList.remove('disabled-div');
            tab1.classList.add('disabled-div');

            card5.classList.add('slideUp');
            card6.classList.add('slideUp2');
            card7.classList.add('slideUp3');
            card8.classList.add('slideUp4');
        }, 2000);
    } else if (tab == 1) {

      if(IsMoblie == true){
         tab1.classList.remove('disabled-div');
         tab2.classList.add('disabled-div');
         tabButton1.classList.add('tab-active');
         return;
      }

        tabButton1.classList.add('tab-active');

        tab2.classList.add('slideDown');
        tab1.classList.add('slideUp');

        card5.classList.add('slideDown');
        card6.classList.add('slideDown2');
        card7.classList.add('slideDown3');
        card8.classList.add('slideDown4');

        setTimeout(function() {
            tab1.classList.remove('disabled-div');
            tab2.classList.add('disabled-div');
            card1.classList.add('slideUp');
            card2.classList.add('slideUp2');
            card3.classList.add('slideUp3');
            card4.classList.add('slideUp4');
        }, 2000);
    }
    // You can add any other code you want to execute when the button is pressed here.
}

document.addEventListener("DOMContentLoaded", function () {
  particlesJS("particles-js", {
    "particles": {
       "number": {
          "value": 100,
          "density": {
             "enable": true,
             "value_area": 800
          }
       },
       "color": {
          "value": "#ffffff"
       },
       "shape": {
          "type": "circle",
          "stroke": {
             "width": 0,
             "color": "#000000"
          },
          "polygon": {
             "nb_sides": 5
          }
       },
       "opacity": {
          "value": 0.5,
          "random": false,
          "anim": {
             "enable": false,
             "speed": 1,
             "opacity_min": 0.1,
             "sync": false
          }
       },
       "size": {
          "value": 3,
          "random": true,
          "anim": {
             "enable": false,
             "speed": 40,
             "size_min": 0.1,
             "sync": false
          }
       },
       "line_linked": {
          "enable": false, // Set this to false to disable connections
          "distance": 150,
          "color": "#ffffff",
          "opacity": 0.4,
          "width": 1
       },
       "move": {
          "enable": true,
          "speed": 6,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
             "enable": false,
             "rotateX": 600,
             "rotateY": 1200
          }
       }
    },
    "interactivity": {
       "detect_on": "canvas",
       "events": {
          "onhover": {
             "enable": true,
             "mode": "repulse"
          },
          "onclick": {
             "enable": true,
             "mode": "push"
          },
          "resize": true
       },
       "modes": {
          "grab": {
             "distance": 400,
             "line_linked": {
                "opacity": 1
             }
          },
          "bubble": {
             "distance": 400,
             "size": 40,
             "duration": 2,
             "opacity": 8,
             "speed": 3
          },
          "repulse": {
             "distance": 200
          },
          "push": {
             "particles_nb": 4
          },
          "remove": {
             "particles_nb": 2
          }
       }
    },
    "retina_detect": true
 });
});