/*
  Mapillary Stuff
*/

import {Viewer} from 'mapillary-js';

let round = 1;
let score = 0;
let correctAnswer = 0;
let viewer1;
let viewer2

function getViews(round) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if(xhr.status === 200) {
      const r = JSON.parse(xhr.responseText);
      disposeViewers();
      viewer1 = new Viewer({
        accessToken: 'MLY|6425749720781602|74d4571106775c1ff773082d77b80f27',
        container: 'mly1',
        imageId: r['id1'],
      });
      viewer1.deactivateCover();
      
      viewer2 = new Viewer({
        accessToken: 'MLY|6425749720781602|74d4571106775c1ff773082d77b80f27',
        container: 'mly2',
        imageId: r['id2'],
      });
      viewer2.deactivateCover();
      
      const questionElement = document.getElementById('question');
      questionElement.innerText = r['question']
      correctAnswer = r['correct'];
      console.log("Round: " + round);
      console.log("Points: " + score);
    }
    else {
      console.log("not epic");
    }
  };

  const url = new URL("/StreetViewsPls", location.href);
  url.searchParams.set("round", round);
  xhr.open("GET", url);
  xhr.send();
}

function endRound(answer) {
  /*
  Temporary solution. Client should send answer to server and get a boolean as response
  and add points accordingly
  */
  if(answer === correctAnswer) {
    score += 100;
  }
  round++;
  console.log(round);
  console.log(score);
  if(round > 5) {
    console.log("End of Game");
    console.log("Final Score: " + score + " Points");
    // Send score to server
    
  } else {
    getViews(round);
  }
}
function disposeViewers() {
  if(viewer1 && viewer2) {
    viewer1.remove();
    viewer2.remove();
  } 
}
/*



const toggleTheme = () => {
  document.body.classList.toggle("dark-theme");
};

document.getElementById("nav-theme").addEventListener("click", toggleTheme);

*/

const toggleTheme = () => {
  const body = document.body;

  if (body.classList.contains("light-theme")) {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
  } else {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
  }
};

document.getElementById("nav-theme").addEventListener("click", toggleTheme);

const showSection = (sectionId) => {
  // Hide all sections
  document.querySelectorAll("main > section").forEach((section) => {
    section.classList.add("hidden");
  });

  // Show the selected section
  document.getElementById(sectionId).classList.remove("hidden");
};

document.getElementById("nav-home").addEventListener("click", () => {
  showSection("home-view");
});

document.getElementById("nav-leaderboard").addEventListener("click", () => {
  showSection("leaderboard-view");
});

document.getElementById("nav-login").addEventListener("click", () => {
  showSection("login-view");
});

// Show the game view by default
showSection("game-view");

document.getElementById("quick-game").addEventListener("click", () => {
  getViews(1);
  showSection("game-view");
});

document.getElementById("home-login").addEventListener("click", () => {
  showSection("login-view");
});

// Listener for game buttons
document.getElementById("b1").addEventListener("click", () => {
  endRound(1);
})
document.getElementById("b2").addEventListener("click", () => {
  endRound(2);
})

// Show the home view by default
showSection("home-view");
