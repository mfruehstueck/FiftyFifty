/*
  Mapillary Stuff
*/

import {Viewer} from 'mapillary-js';

let viewer1;
let viewer2;
let countdownInterval;
let timerElement;
let timerMode = false;
let timerModefast = false;

let currentRound = {
    roundIdx: 0,
    question: "",
    imageID1: "",
    imageID2: "",
    currentScore: 0,
    quessWasCorrect: false
}

let userScheme = {
    username: "",
    countryCode: "",
    highscore: 0,
    style: "dark",
    lastTenPlayedGames: [],

    gameSettings: {
        maxRounds: 4,
        roundTime: 30,
        roundTimeFast: 20
    },

    game: {
        round: -1,
        roundTime: 30,
        score: 0
    }
};
let loggedUser = null;

//::::::::DOM::::::::
// nav
const nav_login = document.getElementById("nav-login");

// home
let nav_home_login = document.getElementById("home-login");

// profile and login
// profile
const form_profile = document.getElementById("profile_form");
const form_profile_username = document.getElementById("profile_username");
const profile_form_username = document.getElementById("profile_form_username");
const profile_form_password = document.getElementById("profile_form_password");
const profile_form_countryCode = document.getElementById("profile_form_countryCode");
const profile_form_maxRounds = document.getElementById("profile_form_maxRounds");
const profile_form_roundTime = document.getElementById("profile_form_roundTime");
const profile_form_roundTimeFast = document.getElementById("profile_form_roundTimeFast");
const form_profile_deleteAccount = document.getElementById("profile_form_deleteAccount");
// login
let form_login = document.getElementById("login-form");

// leaderboard
let nav_leaderboard_table = document.getElementById("leaderboard_table");
let nav_leaderboard_tBody = document.getElementById("leaderboard_tBody");
//::::::::DOM::::::::


setOnLoad();

function setOnLoad() {
    if (loggedUser) {
        nav_login.value = loggedUser.username;
    }
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

function disposeViewers() {
    if (viewer1 && viewer2) {
        viewer1.remove();
        viewer2.remove();
    }
}

function startCountdown() {
    let timeleft = 0;
    if (timerMode) {
        timeleft = 30;
    }
    if (timerModefast) {
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

    let xhr = new XMLHttpRequest();
    xhr.onload = () => {
        let tmpRound = JSON.parse(xhr.response);

        currentRound.roundIdx = tmpRound.roundIdx;
        currentRound.question = tmpRound.question;
        currentRound.imageID1 = tmpRound.imageID1;
        currentRound.imageID2 = tmpRound.imageID2;
        currentRound.currentScore = tmpRound.currentScore;
        currentRound.quessWasCorrect = tmpRound.quessWasCorrect;

        console.log("currentRound answer: " + answer);
        console.log(currentRound);

        updateRound();
        updateScore();

        const questionElement = document.getElementById('question');
        questionElement.innerText = currentRound.question;
        if (timerMode === true || timerModefast === true) {
            startCountdown();
        }

        if (tmpRound.gameWon !== true) {
            let info = (currentRound.quessWasCorrect) ? "WELL DONE!" : "NOPE";
            showPopup(info, "NEXT TASK!");

            getViews(currentRound);
        } else {
            showPopup("GAME OVER WITH: " + currentRound.currentScore, "-> NEXT LEVEL!");
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
}

// function nextRound() {
//     if (round >= 5) {
//         const roundElement = document.getElementById('round-id');
//         roundElement.textContent = "End of Game";
//         clearInterval(countdownInterval);
//         timerElement.textContent = "Time is up!";
//     } else {
//         round++;
//         updateRound();
//         getViews(round);
//     }
// }

function showPopup(text, buttonText, onContinue = null) {
    const overlay = document.createElement("div");
    overlay.setAttribute("id", "overlay");
    containerScore.appendChild(overlay);
    const popupText = document.createElement("p");
    popupText.setAttribute("id", "correct");
    containerScore.appendChild(popupText);
    const continueButton = document.createElement("button");
    continueButton.setAttribute("id", "continueButton");

    popupText.append(text);

    containerScore.appendChild(continueButton);
    continueButton.append(buttonText);
    continueButton.addEventListener("click", () => {
        if (onContinue !== null) onContinue();
        popupText.parentNode.removeChild(popupText);
        continueButton.parentNode.removeChild(continueButton);
        overlay.parentNode.removeChild(overlay);
    });
}

function showTimerModeFast() {
    initGame();
    timerMode = false;
    timerModefast = true;
    if (!timerElement) {
        timerElement = document.createElement("p");
        timerElement.setAttribute("id", "timer-id");
        let containerScore = document.getElementById("score");
        containerScore.appendChild(timerElement);
        timerElement.append("Countdown: ");
    }
}

function showTimerMode() {
    initGame();
    timerModefast = false;
    timerMode = true;
    if (!timerElement) {
        timerElement = document.createElement("p");
        timerElement.setAttribute("id", "timer-id");
        let containerScore = document.getElementById("score");
        containerScore.appendChild(timerElement);
        timerElement.append("Countdown: ");
    }
}

const showSection = (sectionId) => {
    // Hide all sections
    document.querySelectorAll("main > section").forEach((section) => {
        section.classList.add("hidden");

    });

    // Show the selected section
    document.getElementById(sectionId).classList.remove("hidden");
};

document.getElementById("nav-home").addEventListener("click", () => showSection("home-view"));
document.getElementById("timer-game").addEventListener("click", () => showTimerMode());
document.getElementById("timer-game-fast").addEventListener("click", () => showTimerModeFast());
// Listener for game buttons
document.getElementById("b1").addEventListener("click", () => endRound(1))
document.getElementById("b2").addEventListener("click", () => endRound(2))
document.getElementById("home-login").addEventListener("click", () => showSection("login-view"));

document.getElementById("nav-leaderboard").addEventListener("click", () => {
    let cleanTBody = document.createElement("tbody");
    cleanTBody.id = "leaderboard_tBody";
    // nav_leaderboard_tBody.parentNode.replaceChild(cleanTBody, nav_leaderboard_tBody);
    // nav_leaderboard_tBody = nav_leaderboard_table.bodies[0];

    fetch("/leaderboard")
        .then(response => response.json())
        .then(data => {
            // let tmpData = JSON.parse(data);
            console.log(data);
            let rankNumber = 1;
            for (const entry of data) {
                let row = nav_leaderboard_table.insertRow();
                let rank = document.createElement("TD");
                let username = document.createElement("TD");
                let highscore = document.createElement("TD");
                rank.appendChild(document.createTextNode((rankNumber++).toString()));
                username.appendChild(document.createTextNode(entry.username));
                highscore.appendChild(document.createTextNode(entry.highscore));
                row.append(rank, username, highscore);
            }
            showSection("leaderboard-view");
        })
        .catch(error => console.log(error));
});

function setSelectList(selectionNode, items) {
    let sel_option;
    let sel_option_text;
    clearSelectList(selectionNode);
    for (const item of items) {
        sel_option = document.createElement("option");
        sel_option.setAttribute("value", item);

        sel_option_text = document.createTextNode(item);
        sel_option.append(sel_option_text);

        selectionNode.appendChild(sel_option);
    }
}


nav_login.addEventListener("click", () => {
    let sel_countryCode;
    let nextView;

    if (loggedUser) {
        nextView = "profile-view";
        sel_countryCode = document.getElementById("profile_form_countryCode");
    } else {
        nextView = "login-view";
        sel_countryCode = document.getElementById("countryCode");
    }

    fetch("/countryCodes")
        .then(response => response.json())
        .then(data => setSelectList(sel_countryCode, data))
        .catch(error => console.log(error));

    showSection(nextView);
});

function setUserInfo(username) {

}

form_login.addEventListener("submit", () => {
    const input_username = document.getElementById("username");
    const input_password = document.getElementById("password");
    const sel_countryCode = document.getElementById("countryCode");


    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            let tmpUser = JSON.parse(xhr.response);

            loggedUser = { ...userScheme };
            loggedUser.username = tmpUser.username;
            loggedUser.highscore = tmpUser.highscore;
            loggedUser.countryCode = tmpUser.countryCode;
            loggedUser.gameSettings = tmpUser.gameSettings;
            loggedUser.style = tmpUser.style;

            nav_login.textContent = input_username.value;
            nav_home_login.textContent = input_username.value;
            form_login.reset();
            showSection("profile-view");

            alert("Welcome [" + input_username.value + "]");
        } else {
            alert(`[${input_username.value}] invalid password`);
        }
    };
    xhr.open("POST", "/user");
    xhr.setRequestHeader("user", JSON.stringify({ username: input_username.value, password: input_password.value, countryCode: sel_countryCode.value }));
    xhr.send();
});

form_profile.addEventListener("submit", () => {
    let tmpProfile = {
        username: profile_form_username.value,
        countryCode: profile_form_countryCode.value,
        maxRounds: profile_form_maxRounds.value,
        roundTime: profile_form_roundTime.value,
        roundTimeFast: profile_form_roundTimeFast.value
    }

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            alert("Profile saved!");
        } else {
            console.log("sry: form_profile/submit");
        }
    };
    xhr.open("PUT", "/profile");
    xhr.setRequestHeader("profile", JSON.stringify(tmpProfile));
    xhr.send();
})

form_profile_deleteAccount.addEventListener("click", () => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.status === 200) {
            alert("User data deleted!");
        } else {
            console.log("sry: form_profile_deleteAccount/click");
        }
    };
    xhr.open("DELETE", "/deregister");
    xhr.send();
})

function clearSelectList(selectionNode) {
    for (let i = 0; i <= selectionNode.options.length; i++) selectionNode.options[i] = null;
}

function initGame() {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        console.log(xhr.response);
        if (xhr.response === "") {
            alert("NOPE");
            return;
        }

        let tmpRound = JSON.parse(xhr.response);


        currentRound.roundIdx = tmpRound.roundIdx;
        currentRound.question = tmpRound.question;
        currentRound.imageID1 = tmpRound.imageID1;
        currentRound.imageID2 = tmpRound.imageID2;
        currentRound.currentScore = tmpRound.currentScore;
        currentRound.quessWasCorrect = tmpRound.quessWasCorrect;

        console.log(currentRound);

        updateRound();
        updateScore();

        const questionElement = document.getElementById('question');
        questionElement.innerText = currentRound.question;
        if (timerMode === true || timerModefast === true) {
            startCountdown();
        }

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

document.getElementById("timer-game").addEventListener("click", () => {
    initGame();
    timerMode = true;
    if (!timerElement) {
        timerElement = document.createElement("p");
        timerElement.setAttribute("id", "timer-id");
        let containerScore = document.getElementById("score");
        containerScore.appendChild(timerElement);
        timerElement.append("Countdown: ");
    }
});

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