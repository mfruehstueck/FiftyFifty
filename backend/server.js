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

// session management
let session;
// let sessionList;
let user = {
    username: "",
    password: "",
    highscore: 0,
    style: "dark"
};
let leaderboardList;
let userList = [user];

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const sessions = require("express-session");
const cookieParser = require("cookie-parser");

function parseMathExpression(input) {
    return Function(`'use strict'; return (${input})`)();
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

app.post("/user", (req, res) => {
    user.username = req.query.username;
    user.password = req.query.password;

    console.log("User:");
    console.log(user);
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
        req.session = user.username;
    }
    console.log("Users:");
    console.log(userList);

    session = req.session;
    session.userid = user.username;
    // req.session.save();
    return res.status(201).json({ info: `[${user.username}] logged in` });
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
app.get("/leaderboard", (req, res) => {
    console.log("leaderboard:");
});

app.listen(3000);
console.log("Server now listening on http://localhost:3000/");