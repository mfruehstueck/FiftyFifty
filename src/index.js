/*
  Mapillary Stuff
*/
import {Viewer} from "mapillary-js";

// let currentRound = 1;
let score = 0;
let correctAnswer = 0;
let countdownInterval;
let timerMode = false;
let viewer1;
let viewer2;

let currentRound = {
    roundIdx: 0,
    question: "",
    imageID1: "",
    imageID2: "",
    currentScore: 0
}


function getViews(round, containerID1 = "mly1", containerID2 = "mly2") {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        disposeViewers();
        viewer1 = new Viewer({
            accessToken: "MLY|6425749720781602|74d4571106775c1ff773082d77b80f27",
            container: containerID1,
            imageId: round.imageID1,
        });
        viewer1.deactivateCover();
        viewer2 = new Viewer({
            accessToken: "MLY|6425749720781602|74d4571106775c1ff773082d77b80f27",
            container: containerID2,
            imageId: round.imageID2,
        });
        viewer2.deactivateCover();
    }

    xhr.open("GET", "/WTF");
    xhr.send();
}

// function getViews(round) {
//     let containerID1 = "mly1";
//     let containerID2 = "mly2";
//     let imageID1 = 946422635936572;
//     let imageID2 = 2692168084406521;
//     const xhr = new XMLHttpRequest();
//     xhr.onload = function () {
//         if (xhr.status === 200) {
//             const r = JSON.parse(xhr.responseText);
//             disposeViewers();
//             viewer1 = new Viewer({
//                 accessToken: "MLY|6425749720781602|74d4571106775c1ff773082d77b80f27",
//                 container: containerID1,
//                 imageId: imageID1,
//             });
//             viewer1.deactivateCover();
//             viewer2 = new Viewer({
//                 accessToken: "MLY|6425749720781602|74d4571106775c1ff773082d77b80f27",
//                 container: containerID2,
//                 imageId: imageID2,
//             });
//             viewer2.deactivateCover();
//
//             // disposeViewers();
//             // viewer1 = new Viewer({
//             //     accessToken: 'MLY|6425749720781602|74d4571106775c1ff773082d77b80f27',
//             //     container: 'mly1',
//             //     imageId: r['id1'],
//             // });
//             // viewer1.deactivateCover();
//             // console.log(r);
//             // viewer2 = new Viewer({
//             //     accessToken: 'MLY|6425749720781602|74d4571106775c1ff773082d77b80f27',
//             //     container: 'mly2',
//             //     imageId: r['id2'],
//             // });
//             // viewer2.deactivateCover();
//
//             // const questionElement = document.getElementById('question');
//             // questionElement.innerText = r['question']
//             // correctAnswer = r['correct'];
//             // if (timerMode === true) {
//             //     startCountdown();
//             // }
//             console.log("Round: " + round);
//             console.log("Points: " + score);
//
//         } else {
//             console.log("not epic");
//         }
//     };
//
//     const url = new URL("/StreetViewsPls", location.href);
//     console.log(url);
//     url.searchParams.set("round", round);
//     xhr.open("GET", url);
//     xhr.send();
// }

function disposeViewers() {
    if (viewer1 && viewer2) {
        viewer1.remove();
        viewer2.remove();
    }
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

    let xhr = new XMLHttpRequest();
    xhr.onload = () => {
        let tmpRound = JSON.parse(xhr.response);

        currentRound.roundIdx = tmpRound.roundIdx;
        currentRound.question = tmpRound.question;
        currentRound.imageID1 = tmpRound.imageID1;
        currentRound.imageID2 = tmpRound.imageID2;
        currentRound.currentScore = tmpRound.currentScore;

        console.log("currentRound answer: " + answer);
        console.log(currentRound);

        updateRound();
        updateScore();

        if (tmpRound.gameWon !== true) getViews(currentRound);
        else {
            const roundElement = document.getElementById('round-id');
            roundElement.textContent = "End of Game";
            if (timerMode) {
                clearInterval(countdownInterval);
                timerElement.textContent = "Time is up!";
            }
            console.log('End of Game');
            console.log('Final Score: ' + currentRound.currentScore + ' Points');
            showSection("home-view");
        }
    };
    xhr.open("GET", "/StreetViewsPls");
    xhr.setRequestHeader("guess", answer);
    xhr.send();

    // if (answer === correctAnswer) {
    //     score += 100;
    //     updateScore();
    //
    // }
    //
    //
    // if (currentRound.roundIdx >= 5) {
    //     const roundElement = document.getElementById('round-id');
    //     roundElement.textContent = "End of Game";
    //     clearInterval(countdownInterval);
    //     timerElement.textContent = "Time is up!";
    //     console.log('End of Game');
    //     console.log('Final Score: ' + currentRound.currentScore + ' Points');
    // } else {
    //     currentRound.roundIdx++;
    //     updateRound();
    //     getViews(currentRound);
    // }
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


document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const input_username = document.getElementById("username");
    const input_password = document.getElementById("password");
    const sel_countryCode = document.getElementById("countryCode");

    if (input_username.value === "" || input_password.value === "") alert("Ensure you input a value in both fields!");
    else {
        alert("Welcome [" + input_username.value + "]");

        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            document.getElementById("login-form").reset();
            clearCountryCodes(sel_countryCode);

            showSection("leaderboard-view");
        };
        xhr.open("POST", "/user");
        xhr.setRequestHeader("username", input_username.value);
        xhr.setRequestHeader("password", input_password.value);
        xhr.setRequestHeader("countryCode", sel_countryCode.value);
        xhr.send();
    }
});

function clearCountryCodes(sel_countryCode) {
    for (let i = 0; i <= sel_countryCode.options.length; i++) {
        sel_countryCode.options[i] = null;
    }
}

document.getElementById("nav-login").addEventListener("click", () => {
    const sel_countryCode = document.getElementById("countryCode");
    let sel_countryCode_option;
    let sel_countryCode_option_text;


    fetch("/countryCodes")
        .then(response => response.json())
        .then(data => {
            clearCountryCodes(sel_countryCode);
            for (const countryCodeValue of data) {
                sel_countryCode_option = document.createElement("option");
                sel_countryCode_option.setAttribute("value", countryCodeValue);

                sel_countryCode_option_text = document.createTextNode(countryCodeValue);
                sel_countryCode_option.append(sel_countryCode_option_text);

                sel_countryCode.appendChild(sel_countryCode_option);
            }
        })
        .catch(error => console.log(error));

    showSection("login-view");
});

function initGame() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        let tmpRound = JSON.parse(xhr.response);

        currentRound.roundIdx = tmpRound.roundIdx;
        currentRound.question = tmpRound.question;
        currentRound.imageID1 = tmpRound.imageID1;
        currentRound.imageID2 = tmpRound.imageID2;
        currentRound.currentScore = tmpRound.currentScore;

        console.log(currentRound);

        updateRound();
        updateScore();

        getViews(currentRound);

        showSection("game-view");
    }
    xhr.open("GET", "/StreetViewsPls");
    xhr.setRequestHeader("roundIdx", "-1");
    xhr.send();
}

document.getElementById("quick-game").addEventListener("click", () => {
    initGame();
    timerMode = false;
    if (timerElement) {
        timerElement.parentNode.removeChild(timerElement);
        timerElement = null;
    }
});

let timerElement;
document.getElementById("timer-game").addEventListener("click", () => {
    initGame()
    timerMode = true;
    if (!timerElement) {
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

function playRound(answer) {

}

// Show the home view by default
showSection("home-view");


function updateScore() {
    scoreElement.textContent = "Score: " + currentRound.currentScore;
}

function updateRound() {
    roundElement.textContent = "Round: " + (currentRound.roundIdx + 1);
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