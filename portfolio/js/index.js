const sidebarLinks = document.querySelectorAll('.sidebar a');
const imageContainer = document.querySelector(".image-container");
const overlay = document.getElementById("overlay");
const closeButton = document.getElementById("close-button");

var currentpage = 0;

function smoothScrollToElement(targetElement) {
    // Get the target element's position
    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY;
    // Get the current scroll position
    const startPosition = window.scrollY;
    // Calculate the distance and duration of the scroll
    const distance = targetPosition - startPosition;
    const duration = 1000; // Adjust this value to control the scroll speed (in milliseconds)
  
    let startTime;
  
    function scrollAnimation(currentTime) {
      if (!startTime) startTime = currentTime;
  
      const timeElapsed = currentTime - startTime;
      const scrollProgress = Math.min(timeElapsed / duration, 1);
      const newScrollPosition = startPosition + distance * easeOutCubic(scrollProgress);
  
      window.scrollTo(0, newScrollPosition);
  
      if (timeElapsed < duration) {
        requestAnimationFrame(scrollAnimation);
      }
    }
  
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
  
    requestAnimationFrame(scrollAnimation);
}

function hideElement(element) {
    element.style.display = "none";
}

function nextPage(){
    if(currentpage < 5){
        ChangePage(currentpage + 1);
    }
    else{
        ChangePage(0);
    }
}
function backPage(){
    if(currentpage > 0){
        ChangePage(currentpage - 1);
    }
    else{
        ChangePage(5);
    }
}

function ChangePage(page) {
    const buttons = document.querySelectorAll(".tabs_button");
    var image = $("#project-image");
    const title =  document.getElementById("project-Title");
    const contect =  document.getElementById("project-contect")
    var linkElement = document.getElementById("project-button-2");
    const buttonsArray = Array.from(buttons);

    for (let i = 0; i < buttonsArray.length; i++) {
        try {
            buttonsArray[i].classList.remove("active-Button");
            //console.log("Removed active-Button from: " + i);
        } catch (error) {
            console.log("Could not remove active-Button from: " + i);
        }
    }
    buttonsArray[page].classList.add("active-Button");
    currentpage = page;
    console.log("Added active-Button to: " + page);

    if(linkElement){
      console.log("a")
    }

    if(currentpage == 0)
    {
        image.attr("src", "https://raw.githubusercontent.com/TheRealJoelmatic/RemoveAdblockThing/main/Thumbnail.jpg");
        console.log("updated image to : " + currentpage);
        title.innerHTML = `<span class="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">Most Popular</span>Remove The Adblock Popup For YOUTUBE`;
        contect.innerHTML = `<span style="color: white; font-size: 20px;"><br> Overview: </span><br>
          
        This project involved the development of a Tampermonkey script to bypass the "ad blockers are not allowed on YouTube"<br>
        message that is commonly displayed to users who attempt to watch videos on YouTube with ad-blocking <br>
        extensions enabled. The script was designed to enhance the user experience by allowing them to enjoy YouTube content<br>
        without being interrupted by advertisements.</p>`
        linkElement.href = "https://github.com/TheRealJoelmatic/RemoveAdblockThing";
    }
    else if(currentpage == 1){
        image.attr("src", "portfolio/img/Unlock.jpg");
        title.innerHTML = "Combat Master Unlocker";
        contect.innerHTML = `<span style="color: white; font-size: 20px;"><br> Overview: </span><br>
          
        I developed this using C# in combination with Melon Loader.<br>
        This unique software allows players to unlock all in-game cosmetics with a click of a button<br>
        within the popular game "Combat Master," all without resorting to traditional cheats or hacks. Instead,<br>
        it leverages the power of Melon Loader, a well-known modding framework, to provide users with a legitimate and enjoyable<br>
        way to access a wide range of soft and hard unlocks.</p>`;
        linkElement.href = "https://github.com/TheRealJoelmatic/Combat-Master-Unlocker";
        console.log("updated image to : " + currentpage);
    }
    else if(currentpage == 2){
        image.attr("src", "portfolio/img/Autoclicker.jpg");
        title.innerHTML = "🌕 Matic clicker 🌕";
        contect.innerHTML = `<span style="color: white; font-size: 20px;"><br> Overview: </span><br>
          
        Minecraft auto-clicker developed in C++. This user-friendly and robust tool<br>
        is designed to provide players with a seamless auto-clicking experience, <br>
        allowing them to automate repetitive actions in Minecraft. Notably, this auto-clicker is powerful enough<br>
        to bypass popular Minecraft servers like Hypixel and MMC.`;
        linkElement.href = "https://github.com/TheRealJoelmatic/Matic-Clicker";
        console.log("updated image to : " + currentpage);
    }
    else if(currentpage == 3){
        image.attr("src", "https://camo.githubusercontent.com/126c7b40e26c992d92c6993e4ec5a3e6a7e2fb83df16ec414b197db2148f125e/68747470733a2f2f6d656469612e646973636f72646170702e6e65742f6174746163686d656e74732f3835393133303339333538383533313232312f313133313233323638373634373130313031392f696d6167652e706e673f77696474683d393934266865696768743d353433");
        title.innerHTML = "Eraser Trainer";
        contect.innerHTML = `<span style="color: white; font-size: 20px;"><br> Overview: </span><br>
          
        mod menu created for the platformer game "Eraser."<br>
        This versatile software enables players to access a wide array of features,<br>
        including teleports, god mode, custom high jumps, and quick restarts for speedrunners,<br>
        elevating their gameplay experience to new heights.<br>
        this project showcases my expertise in developing trainers and mod menus,<br>
        offering players the ability to enhance and personalize their gameplay experience `;
        linkElement.href = "https://github.com/TheRealJoelmatic/Eraser-Trainer";
        console.log("updated image to : " + currentpage);
    }
    else if(currentpage == 4){
        image.attr("src", "portfolio/img/Mcc.jpeg");
        title.innerHTML = "Mc Name Checker";
        contect.innerHTML = `<span style="color: white; font-size: 20px;"><br> Overview: </span><br>
          
        high-speed Minecraft name checker developed in C++.<br>
        This robust tool harnesses the power of proxies and multi-threading to provide <br>
        users with a lightning-fast method of checking the availability of Minecraft usernames. `;
        linkElement.href = "https://github.com/TheRealJoelmatic/McNameChecker";
        console.log("updated image to : " + currentpage);
    }
    else if(currentpage == 5){
        image.attr("src", "portfolio/img/pacman.JPG");
        title.innerHTML = "Games";
        contect.innerHTML = `<span style="color: white; font-size: 20px;"><br> Overview: </span><br>
          
        This is all the games I have coded using unity `;
        linkElement.href = "https://joelmatic.itch.io/";
        console.log("updated image to : " + currentpage);
    }

}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;

  // Make the textarea non-editable to avoid flickering when focusing
  textarea.setAttribute('readonly', '');

  // Append the textarea to the body
  document.body.appendChild(textarea);

  // Select the text in the textarea
  textarea.select();

  // Copy to clipboard
  document.execCommand('copy');

  // Remove the textarea from the DOM
  document.body.removeChild(textarea);
}

function changeTextOnClick(element, newText, duration) {
  // Get the original text
  const originalText = element.innerText;
  const children = Array.from(element.children);

  // Change the text to the new text
  element.innerText = newText;

  // Set a timeout to revert the text back to the original after the specified duration
  setTimeout(function () {
    element.innerText = originalText;
    element.appendChild(children);
  }, duration);
}


document.addEventListener("DOMContentLoaded", function() {

  document.documentElement.classList.add('dark');

  var loadElement = document.getElementById("load");
  var mainElement = document.getElementById("main");

  if (loadElement) loadElement.remove();
  if (mainElement) mainElement.classList.remove("inv"); // Replace "property-name" with the specific property you want to remove

});

window.addEventListener('load', function () {
      document.documentElement.classList.add('dark'); // 'dark' class defines your dark mode styles
      localStorage.theme = 'dark'; // Store the theme preference
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("loading particles")
    particlesJS("particles-js", {
        "particles": {
          "number": {
            "value": 33,
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": {
            "value": "#f5f5f5"
          },
          "shape": {
            "type": "circle",
            "stroke": {
              "width": 0,
              "color": "#ffffff"
            },
            "polygon": {
              "nb_sides": 3
            },
            "image": {
              "src": "img/github.svg",
              "width": 100,
              "height": 100
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
            "value": 7.891476416322726,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 40,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": true,
            "distance": 0,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
          },
          "move": {
            "enable": true,
            "speed": 1.5782952832645452,
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
              "enable": false,
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
              "distance": 127.87212787212788,
              "duration": 0.4
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
