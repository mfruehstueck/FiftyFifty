if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const rounds = require("./rounds.js");

const app = express();

const sessions = require("express-session");
const cookieParser = require("cookie-parser");

// Parse urlencoded bodies
// app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, '..', 'src')));

//session
app.use(sessions({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        cookie: { maxAge: parseMathExpression(process.env.SESSION_MAXAGE) },
        resave: false
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cookieParser());

app.get("/StreetViewsPls", function (req, res) {
    // game rounds
    // -1 ... startOfGame
    // 0 ... infiniteRounds
    // x ... roundCount

    console.log(":::::::StreetViewsPls:::::::");
    console.log(req.session.username);

    const tmpUser = getUser(req.session.username);
    console.log(tmpUser);
    if (tmpUser === null) {
        console.log("NOPE");

        res.redirect("/");
        return;
    }

    let currentRound = {
        roundIdx: 0,
        question: rounds[0].question,
        imageID1: rounds[0].id1,
        imageID2: rounds[0].id2,
        quessWasCorrect: false,
        currentScore: 0,
        gameWon: false
    };

    if (tmpUser.game.round < 0 || req.header("roundIdx") < 0) {
        console.log("START");
        tmpUser.game.round = 0;
        tmpUser.game.score = 0;

    } else if (tmpUser.game.round >= tmpUser.game.rounds) {
        console.log("WON");

        if (tmpUser.game.score > tmpUser.highscore) tmpUser.highscore = tmpUser.game.score;
        tmpUser.game.round = -1;

        currentRound.currentScore = tmpUser.game.score;
        currentRound.gameWon = true;
        res.redirect("/");
    } else {
        console.log("NEXT");
        if (req.headers.guess == rounds[tmpUser.game.round].correct) {
            tmpUser.game.score += 100;
            currentRound.quessWasCorrect = true;
        }
        currentRound.roundIdx = ++tmpUser.game.round;
        currentRound.question = rounds[tmpUser.game.round].question;
        currentRound.imageID1 = rounds[tmpUser.game.round].id1;
        currentRound.imageID2 = rounds[tmpUser.game.round].id2;
        currentRound.currentScore = tmpUser.game.score;

    }
    console.log("currentRound");
    console.log(currentRound);
    console.log("score " + tmpUser.score);
    res.send(currentRound);
})

// no idea why this is needed but it does not work without it
app.get("/WTF", (req, res) => {
    res.sendStatus(200);
});

// session management
let session = {};
let user = {
    username: "",
    password: "",
    countryCode: "",
    highscore: 0,
    style: "dark",
    lastTenPlayedGames: [],

    game: {
        rounds: 4,
        round: -1,
        score: 0
    }
};
let userList = [];

function parseMathExpression(input) {
    return Function(`'use strict'; return (${input})`)();
}

function getUser(username) {
    // getUser if exists
    if (username !== "") {
        for (const u of userList) if (u.username === username) return u;
    }

    return null;
}

function validateUser(username, password, countryCode) {
    // returns user if found and adds to list if not
    let tmpUser = getUser(username);
    if (tmpUser !== null) {
        if (tmpUser.password !== password) return null;
    } else {
        console.log(`[${username}] does not exist`);

        tmpUser = { ...user };
        console.log(tmpUser)
        tmpUser.username = username;
        tmpUser.password = password;
        tmpUser.countryCode = countryCode;

        userList.push(tmpUser);
    }

    return tmpUser;
}

app.get('/', function (req, res) {
    session = req.session;
    console.log("user: " + session.username);
    res.sendFile(path.join(__dirname, '..', 'src', 'main.html'));
});

app.get("/countryCodes", (req, res) => {
    res.send([
        "nop",
        "Austria",
        "Australia"
    ]);
});

app.post("/user", (req, res) => {
    // inputs from login-form
    // let tmpUser = { user };
    let username = req.header("username");
    let password = req.header("password");
    let countryCode = req.header("countryCode");

    user = validateUser(username, password, countryCode);

    if (user !== null) {
        session = req.session;
        session.username = user.username;

        res.redirect("/");
    } else {
        console.log(`[${username}] invalid password`);
    }
});

app.get("/users", (req, res) => {
    return res.status(200).json(userList);
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    return res.status(204).json({ info: `[${user.name}] logged out` });
});

app.delete("/deregister", (req, res) => {
    console.log("deregister");
});

// leaderboard
const leaderboardEntry = {
    rank: 0,
    username: "",
    score: 0
}
let leaderboardList = [];

function updateLeaderboard(user) {
    let tmpUser = leaderboardList.find((username) => username === user.username);
    if (tmpUser) {
        tmpUser.highscore = user.highscore;
    } else {
        leaderboardList.push(user);
    }
    leaderboardList.sort((a, b) => a.highscore - b.highscore);
}

app.get("/leaderboard", (req, res) => {
    res.send(leaderboardList);
    console.log("leaderboard:");
});

app.listen(3000);
console.log("Server now listening on http://localhost:3000/");