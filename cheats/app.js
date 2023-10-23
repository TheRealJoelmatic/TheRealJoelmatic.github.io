function search() {
    // Get the input value
    var input = document.getElementById("searchInput").value.toLowerCase();

    // Get all card containers
    var cardContainers = document.getElementsByClassName("card");
    var noCard = document.getElementById("noCard");

    var cardsFound = false; // Initialize a variable to track if any cards were found

    if (noCard) {
        console.log("cYA noCard")
        noCard.textContent = "Voted NO.1 place to find FREE minecraft cheats.";
    }

    // Loop through card containers and hide/show based on the search input
    for (var i = 0; i < cardContainers.length; i++) {
        var cardTitle = cardContainers[i].getElementsByClassName("card-title")[0].textContent.toLowerCase();

        if (cardTitle.includes(input)) {
            cardContainers[i].style.display = "block";  // Show matching cards
            cardsFound = true; // Set the flag to true if a matching card is found
        } else {
            cardContainers[i].style.display = "none";   // Hide non-matching cards
        }
    }

    // Log a message to the console if no matching cards were found
    if (!cardsFound) {
        console.log("No matching cards found.");
        noCard.textContent = "Nothing found... Try a different search query";
        console.log("hI noCard")
    }
}

document.addEventListener("DOMContentLoaded", function () {
    particlesJS("particles-js", {
        "particles": {
          "number": {
            "value": 20,
            "density": {
              "enable": true,
              "value_area": 800
            }
          },
          "color": {
            "value": "#ffffff"
          },
          "shape": {
            "type": "star",
            "stroke": {
              "width": 0,
              "color": "#000000"
            },
            "polygon": {
              "nb_sides": 5
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
              "speed": 0.1,
              "opacity_min": 0.1,
              "sync": false
            }
          },
          "size": {
            "value": 4,
            "random": true,
            "anim": {
              "enable": false,
              "speed": 5,
              "size_min": 0.1,
              "sync": false
            }
          },
          "line_linked": {
            "enable": false
          },
          "move": {
            "enable": true,
            "speed": 0.1,
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
              "distance": 200,
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
