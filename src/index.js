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
let timerElement;
let timerMode = false;
let timerModefast = false;

function getViews(round) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            const r = JSON.parse(xhr.responseText);
            console.log(r);
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
            if(timerMode === true || timerModefast === true){
            startCountdown();
          }
        } 
    };

    const url = new URL("/StreetViewsPls", location.href);
    url.searchParams.set("round", round);
    xhr.open("GET", url);
    xhr.send();
}


function disposeViewers() {
  if (viewer1 && viewer2) {
      viewer1.remove();
      viewer2.remove();
  }
}


function startCountdown() {
  let timeleft = 0;
  if(timerMode) {
  timeleft = 30;}
  if(timerModefast) {
  timeleft = 20;
  }
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

  if (answer === correctAnswer || correctAnswer === 0) {
    score += 100;
    updateScore();
    showCorrectAnswer(answer);
    
  } else {
    showCorrectAnswer(answer);
  }
}


function nextRound() {
  if (round >= 5) {
    const roundElement = document.getElementById('round-id');
    roundElement.textContent = "End of Game";
    clearInterval(countdownInterval);
    timerElement.textContent = "Time is up!";
  } else {
    round++;
    updateRound();
    getViews(round);
  }
}



function showCorrectAnswer(answer) {
  const overlay = document.createElement("div");
  overlay.setAttribute("id", "overlay");
  containerScore.appendChild(overlay);
  const correct = document.createElement("p");
  correct.setAttribute("id", "correct");
  containerScore.appendChild(correct);
  const continueButton = document.createElement("button");
  continueButton.setAttribute("id", "continueButton");
  if(round < 5) {
    if(answer === correctAnswer) {
  correct.append("WELL DONE!"); }
  else {
  correct.append("NOPE.");
  }
  containerScore.appendChild(continueButton);
  continueButton.append("NEXT TASK!");
  continueButton.addEventListener("click", () => {
    nextRound();
    correct.parentNode.removeChild(correct);
    continueButton.parentNode.removeChild(continueButton);
    overlay.parentNode.removeChild(overlay);
  })
  }
  else {
    correct.append("GAME OVER!");
    containerScore.appendChild(continueButton);
    continueButton.append("-> NEXT LEVEL!");
    continueButton.addEventListener("click", () => {
      correct.parentNode.removeChild(correct);
      continueButton.parentNode.removeChild(continueButton);
      overlay.parentNode.removeChild(overlay);
      if(timerMode === false && timerModefast === false) {
      showTimerMode();
      } else {
        showTimerModeFast();
      }
    }) 
  }
  
} 


function showTimerModeFast() {
  round = 1;
  updateRound();
  score = 0;
  updateScore();
  timerMode = false;
  timerModefast = true;
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
}

function showTimerMode() {
  round = 1;
  updateRound();
  score = 0;
  updateScore();
  timerModefast = false;
  timerMode = true;
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
}


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
    timerMode = false;
    timerModefast = false;
    round = 1;
    updateRound();
    score = 0;
    updateScore();
    getViews(1);
    showSection("game-view");
    if(timerElement) {
      timerElement.parentNode.removeChild(timerElement);
      timerElement = null;
    }
  });

  
  document.getElementById("timer-game").addEventListener("click", () => {
    showTimerMode();
  });

  
  document.getElementById("timer-game-fast").addEventListener("click", () => {
    showTimerModeFast();
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
  


//DARK THEME
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
      // toggle theme
      const body = document.querySelector("body");
      const currentIsDark = body.classList.contains("dark-theme");
      setTheme(!currentIsDark);
    });
  });
  


