/*
  Mapillary Stuff
*/

import {Viewer} from "mapillary-js";

let round = 1;
let score = 0;
let correctAnswer = 0;
let countdownInterval;
let timerMode = false;
let viewer1;
let viewer2;

function getViewers(imageID1, imageID2, containerID1 = "mly1", containerID2 = "mly2") {
    disposeViewers();
    viewer1 = new Viewer({
        accessToken: process.env.API_TOKEN,
        container: containerID1,
        imageId: imageID1,
    });
    viewer1.deactivateCover();
    viewer2 = new Viewer({
        accessToken: process.env.API_TOKEN,
        container: containerID2,
        imageId: imageID2,
    });
    viewer2.deactivateCover();
}

function disposeViewers() {
    if (viewer1 && viewer2) {
        viewer1.remove();
        viewer2.remove();
    }
}

// function startCountdown() {
//     let timeleft = 30;
//     const countdownElement = document.getElementById('timer-id');
//     countdownElement.innerHTML = timeleft + ' seconds remaining';
//     countdownInterval = setInterval(function () {
//         if (timeleft <= 0) {
//             countdownElement.innerHTML = "Time's up!";
//             endRound(null);
//         } else {
//             timeleft -= 1;
//             countdownElement.innerHTML = timeleft + ' seconds remaining';
//         }
//     }, 1000);
// }
//
// function endRound(answer) {
//     clearInterval(countdownInterval); // clear countdown interval
//
//     if (answer === correctAnswer) {
//         score += 100;
//         updateScore();
//
//     }
//     console.log('Round: ' + round);
//     console.log('Score: ' + score);
//
//     if (round >= 5) {
//         const roundElement = document.getElementById('round-id');
//         roundElement.textContent = "End of Game";
//         clearInterval(countdownInterval);
//         timerElement.textContent = "Time is up!";
//         console.log('End of Game');
//         console.log('Final Score: ' + score + ' Points');
//     } else {
//         round++;
//         updateRound();
//         getViews(round);
//     }
// }

module.exports = {
    getViews
}