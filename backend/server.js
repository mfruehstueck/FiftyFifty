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

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'src', 'main.html'));
});


// session management
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const session = require("express-session");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(session({
        secret: process.env.SESSION_SECRET || "blablub",
        resave: false,
        saveUninitialized: false,
    })
);

let user = {};
const users = [user];

app.post("/login", (req, res) => {
    user.name = req.query.name;
    user.password = req.query.password;
    user.highscore = 0;

    let userExists = false;
    for (const u of users) {
        if (u.name === user.name) {
            userExists = true;
            if (u.password === user.password) {
                user = u;
            } else return res.status(200).json({info: `[${user.name}]: invalid password`})
        }
    }
    if (!userExists) users.push(user);
    console.log("Users:");
    console.log(users);

    req.session.user = user;
    req.session.save();
    return res.status(201).json({info: `[${user.name}] logged in`});
});

app.get("/users", (req, res) => {
    return res.status(200).json(users);
});

app.get("/user", (req, res) => {
    if (req.session.user != null) {
        return res.status(200)
            .json({info: `[${user.name}] profile info`, data: req.session.user});
    } else return res.status(200).json({info: "No data present in session"});
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    return res.status(204).json({info: `[${user.name}] logged out`});
});

app.delete("/deregister", (req, res) => {

});

app.listen(3000)
console.log("Server now listening on http://localhost:3000/")