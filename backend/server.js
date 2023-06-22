const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const rounds = require("./rounds.js");

const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json());


// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, '..', 'src')));
app.use(express.static(path.join(__dirname, '..', 'dist')));

app.get("/StreetViewsPls", function (req, res) {
    let round = Object.values(rounds);
    console.log(round[req.query.round - 1]);
    res.send(round[req.query.round - 1]);
})

// no idea why this is needed but it does not work without it
app.get("/WTF", (req, res) => {
    res.sendStatus(200);
});

// session management
let session = {};
let sessionList = [session];
let user = {
    username: "",
    password: "",
    countryCode: "",
    highscore: 0,
    style: "dark",
    lastTenPlayedGames: []
};
let userList = [user];

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const sessions = require("express-session");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

function parseMathExpression(input) {
    return Function(`'use strict'; return (${input})`)();
}

function getUser(username) {

}

app.use(cookieParser());
app.use(sessions({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        cookie: { maxAge: parseMathExpression(process.env.SESSION_MAXAGE) },
        resave: false
    })
);

app.get('/', function (req, res) {
    session = req.session;
    console.log(session);
    // if(session.userid){
    res.sendFile(path.join(__dirname, '..', 'src', 'main.html'));
    // } else console.log("Fuck");
});

app.get("/countryCodes", (req, res) => {
    res.send([
        "nop",
        "Austria",
        "Australia"
    ]);
});

app.post("/user", (req, res) => {
    user.username = req.body.username;
    user.password = req.body.password;
    user.countryCode = req.body.countryCode;

    // console.log("User:");
    // console.log(user);
    let userExists = false;
    for (const u of userList) {
        if (u.username === user.username) {
            userExists = true;
            if (u.password === user.password) {
                user = u;
            } else return res.status(200).json({ info: `[${user.username}]: invalid password` })
        }
    }
    if (!userExists) userList.push(user);
    else {
        // req.session.username = user.username;
    }
    console.log("Users:");
    console.log(userList);

    session = req.session;
    session.username = user.username;
    session.countryCode = user.countryCode;
    session.style = user.style;

    res.redirect("/");
});

app.get("/users", (req, res) => {
    return res.status(200).json(userList);
});

app.post("/user", (req, res) => {
    if (req.session.user != null) {
        return res.status(200)
            .json({ info: `[${user.name}] profile info`, data: req.session.user });
    } else return res.status(200).json({ info: "No data present in session" });
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    return res.status(204).json({ info: `[${user.name}] logged out` });
});

app.delete("/deregister", (req, res) => {
    console.log("deregister");
});

// leaderboard
let leaderboardList;

app.get("/leaderboard", (req, res) => {
    console.log("leaderboard:");
});

app.listen(3000);
console.log("Server now listening on http://localhost:3000/");