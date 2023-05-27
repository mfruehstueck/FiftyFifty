/*
  Mapillary Stuff
*/

import {Viewer} from 'mapillary-js';

let round = 1;
let score = 0;
let correctAnswer = 0;
let viewer1;
let viewer2;
let countdownInterval;

function getViews(round) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
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
            startCountdown(); 
            console.log("Round: " + round);
            console.log("Points: " + score);

        } else {
            console.log("not epic");
        }
    };

    const url = new URL("/StreetViewsPls", location.href);
    url.searchParams.set("round", round);
    xhr.open("GET", url);
    xhr.send();
}

function startCountdown() {
  let timeleft = 30;
  const countdownElement = document.getElementById('timer-id');
  countdownElement.innerHTML = timeleft + ' seconds remaining';
  countdownInterval = setInterval(function () {
    if (timeleft <= 0) {
      countdownElement.innerHTML = "Time's up!";
      endRound(null);
    } else {
      timeleft -= 1;
      countdownElement.innerHTML = timeleft + ' seconds remaining';
    }
  }, 1000);
}

function endRound(answer) {
  clearInterval(countdownInterval); // clear countdown interval

  if (answer === correctAnswer) {
    score += 100;
    updateScore();
  }
  console.log('Round: ' + round);
  console.log('Score: ' + score);

  if (round >= 5) {
    const roundElement = document.getElementById('round-id');
    roundElement.textContent = "End of Game";
    clearInterval(countdownInterval);
    timerElement.textContent = "Time is up!";
    console.log('End of Game');
    console.log('Final Score: ' + score + ' Points');
  } else {
    round++;
    updateRound();
    getViews(round);
  }
}


function disposeViewers() {
    if (viewer1 && viewer2) {
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

document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("nav-theme");
  
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  
    const setTheme = (prefersDark) => {
      const body = document.querySelector("body");
  
      if (prefersDark) {
        body.classList.remove("light-theme");
        body.classList.add("dark-theme");
        themeToggleBtn.innerHTML =
          '<span class="material-icons">nights_stay</span>';
        themeToggleBtn.classList.remove("light-theme-icon");
        themeToggleBtn.classList.add("dark-theme-icon");
      } else {
        body.classList.remove("dark-theme");
        body.classList.add("light-theme");
        themeToggleBtn.innerHTML = '<span class="material-icons">wb_sunny</span>';
        themeToggleBtn.classList.remove("dark-theme-icon");
        themeToggleBtn.classList.add("light-theme-icon");
      }
    };
  
    setTheme(prefersDarkScheme.matches);
  
    themeToggleBtn.addEventListener("click", () => {
      // Wenn das aktuelle Theme dunkel ist, setzen Sie es auf hell und umgekehrt
      const body = document.querySelector("body");
      const currentIsDark = body.classList.contains("dark-theme");
      setTheme(!currentIsDark);
    });
  });
  
  //++++++++++++++++++++++++++++
  
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
  
  document.getElementById("quick-game").addEventListener("click", () => {
    getViews(1);
    showSection("game-view");
  });

  let timerElement;
  document.getElementById("timer-game").addEventListener("click", () => {
    round = 1;
    updateRound();
    score = 0;
    updateScore();
    clearInterval(countdownInterval);
    getViews(1); 
    showSection("game-view");
    if(!timerElement) {
    timerElement = document.createElement("p");
    timerElement.setAttribute("id", "timer-id");
    let containerScore = document.getElementById("score");
    containerScore.appendChild(timerElement);
    timerElement.append("Countdown: ");
    }
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
  
  
  function updateScore() {
    scoreElement.textContent = "Score: "+score;
  }
  function updateRound() {
    roundElement.textContent = "Round: "+round;
  }
  let roundElement = document.createElement("p");
  roundElement.setAttribute("id", "round-id");
  let containerScore = document.getElementById("score");
  containerScore.appendChild(roundElement);
  
  let scoreElement = document.createElement("p");
  scoreElement.setAttribute("id", "score-id")
  containerScore.appendChild(scoreElement);
  updateScore();
  updateRound();


