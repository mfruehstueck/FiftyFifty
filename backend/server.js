if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
// const rounds = require("./rounds.js");
const randomIds = require("./randomIds.js");
const northernIds = require("./northernIds.js");
const southernIds = require("./southernIds.js");
// for csv parsing
const fs = require("fs");
const {parse} = require("csv-parse");

const app = express();

const sessions = require("express-session");
const cookieParser = require("cookie-parser");

// Parse urlencoded bodies
// app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, '..', 'src')));
// app.use(express.static(path.join(__dirname, '..', 'dist')));

//session
app.use(sessions({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        cookie: {maxAge: parseMathExpression(process.env.SESSION_MAXAGE)},
        resave: false
    })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.use(cookieParser());

// parse cities from csv-file
const result = [];
fs.createReadStream("./worldcities.csv")
    .pipe(parse({delimiter: ",", from_line: 2}))
    .on("data", function (row) {
        //console.log(row);
        result.push(row);
    })
    .on("end", () => {
    });

app.get("/StreetViewsPls", async function (req, res) {
    // game rounds
    // -1 ... startOfGame
    // 0 ... infiniteRounds
    // x ... roundCount

    // random question
    let tmpRound;
    let questionType = Math.floor(Math.random() * 2);
    if (questionType === 0) {
        tmpRound = await generateCountryRound();
    } else {
        tmpRound = generateHemisphereRound();
    }

    console.log(":::::::StreetViewsPls:::::::");
    console.log(req.session.username);

    let currentRound = {
        roundIdx: 0,
        roundTime: 0,
        question: tmpRound.question,
        imageID1: tmpRound.id1,
        imageID2: tmpRound.id2,
        quessWasCorrect: false,
        currentScore: 0,
        gameWon: false
    };

    const tmpUser = getUser(req.session.username);
    if (!tmpUser) {
        console.log("NOPE");

        currentRound = null;
    } else {
        currentRound.roundTime = tmpUser.game.roundTime;
        if (tmpUser.game.round < 0 || req.header("roundIdx") < 0) {
            console.log("START");
            tmpUser.game.round = 0;
            tmpUser.game.score = 0;

        } else if (tmpUser.game.round >= tmpUser.gameSettings.maxRounds) {
            console.log("WON");

            if (tmpUser.game.score > tmpUser.highscore) tmpUser.highscore = tmpUser.game.score;
            tmpUser.game.round = -1;

            currentRound.currentScore = tmpUser.game.score;
            currentRound.gameWon = true;

            updateLeaderboard();
        } else {
            console.log("NEXT");
            // if (req.headers.guess == rounds[tmpUser.game.round].correct) {
            if (req.headers.guess == tmpRound.correct) {
                tmpUser.game.score += 100;
                currentRound.quessWasCorrect = true;
            }
            currentRound.roundIdx = ++tmpUser.game.round;
            currentRound.currentScore = tmpUser.game.score;
        }
    }

    console.log("currentRound");
    console.log(currentRound);
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

        tmpUser = {...user};
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

function getUserWithSession(checkSession) {
    session = checkSession;
    return getUser(session.username);
}

app.get("/sessionUser", (req, res) => {
    session = req.session;
    console.log("currentSession: " + session.username);
    res.status(200).send(JSON.stringify(getUserWithSession(session)));
});

app.get("/countryCodes", (req, res) => {
    res.send([
        "nop",
        "Austria",
        "Australia"
    ]);
});

app.put("/profile", (req, res) => {
    let tmpUser = getUser(req.session.username);
    let tmpProfile = JSON.parse(req.header("profile"));
    console.log("PROFILE");
    console.log(tmpUser);
    console.log(tmpProfile);
    if (tmpUser) {
        tmpUser.countryCode = tmpProfile.countryCode;
        tmpUser.gameSettings.maxRounds = tmpProfile.maxRounds - 1;
        tmpUser.gameSettings.roundTime = tmpProfile.roundTime;
        tmpUser.gameSettings.roundTimeFast = tmpProfile.roundTimeFast;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
    console.log(tmpUser);
    console.log("PROFILE");
});

app.post("/user", (req, res) => {
    // inputs from login-form
    let tmpUser = JSON.parse(req.header("user"));
    let username = tmpUser.username;
    let password = tmpUser.password;
    let countryCode = tmpUser.countryCode;

    user = validateUser(username, password, countryCode);

    if (user) {
        session = req.session;
        session.username = user.username;

        res.sendStatus(200);
    } else {
        console.log(`[${username}] invalid password`);
        res.sendStatus(401);
    }
});

app.get("/users", (req, res) => {
    return res.status(200).json(userList);
});

app.post("/logout", (req, res) => {
    req.session.destroy();
    return res.status(204).json({info: `[${user.name}] logged out`});
});

app.delete("/deregister", (req, res) => {
    userList.splice(userList.indexOf(userList.find((user) => user.username === req.session.username)));
    console.log("deregister");
    res.sendStatus(200);
});

// leaderboard
let leaderboardList = [];

function updateLeaderboard() {
    leaderboardList = [];

    for (const u of userList) leaderboardList.push({username: u.username, highscore: u.highscore});
}

leaderboardList.push({username: "test1", highscore: 100});
leaderboardList.push({username: "test2", highscore: 500});
leaderboardList.push({username: "test3", highscore: 3});

app.get("/leaderboard", (req, res) => {
    leaderboardList.sort((a, b) => b.highscore - a.highscore);
    res.send(leaderboardList);
    console.log("leaderboard:");
    console.log(leaderboardList);
});

// creating random rounds
function generateHemisphereRound() {
    let nIds = Object.values(northernIds);
    let sIds = Object.values(southernIds);
    let m = Math.floor(Math.random() * nIds.length);
    let n = Math.floor(Math.random() * sIds.length);
    let nId = nIds[m].id;
    let sId = sIds[n].id;
    let round = {};
    let l = Math.floor(Math.random() * 2);

    if (l == 0) {
        round["id1"] = nId;
        round["id2"] = sId;
        round["correct"] = 2;
    } else {
        round["id1"] = sId;
        round["id2"] = nId;
        round["correct"] = 1;
    }
    round["question"] = "Which image is in the Southern Hemisphere?";

    return round;
}

async function generateCountryRound() {
    let ids = Object.values(randomIds);
    let n = Math.floor(Math.random() * ids.length);
    let m = Math.floor(Math.random() * ids.length);
    let round = {};

    let id1 = ids[n].id;
    let id2 = ids[m].id;
    let id1Coordinates = await getMapillaryCoordinates(id1);
    let id2Coordinates = await getMapillaryCoordinates(id2);

    round["id1"] = id1;
    round["id2"] = id2;

    console.log(id1Coordinates);
    console.log(id2Coordinates);
    let id1Country = await getCountry(id1Coordinates.coordinates[1], id1Coordinates.coordinates[0]);
    let id2Country = await getCountry(id2Coordinates.coordinates[1], id2Coordinates.coordinates[0]);

    let shuffle = Math.floor(Math.random() * 2);
    if (shuffle == 0) {
        round["correct"] = 1;
        round["question"] = `Which image is in ${id1Country}?`;
    } else {
        round["correct"] = 2;
        round["question"] = `Which image is in ${id2Country}?`;
    }
    // TODO: check if same country
    if (id1Country == id2Country) {
        round["correct"] = 0;
    }
    console.log(round);
    return round;
}

async function generateProximityRound(lat, long) {

}

async function getMapillaryIds(lat1, long1, lat2, long2, fileName) {

    const apiUrl = `https://graph.mapillary.com/images?access_token=${process.env.API_TOKEN}&fields=id,computed_geometry&bbox=${long1},${lat1},${long2},${lat2}`;
    let ids;
    await fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            ids = Object.values(data)[0];

            content = JSON.stringify(ids);
            fs.writeFile(`./backend/${fileName}.js`, content, (err) => {
                if (err) {
                    console.error(err);
                }

            });
        })
        .catch((error) => {
            console.log(error);
        });
    return ids;
}

async function getMapillaryCoordinates(id) {
    const apiUrl = `https://graph.mapillary.com/${id}?access_token=${process.env.API_TOKEN}`;
    await fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            coordinates = Object.values(data)[0];
            //console.log(data);
        })
        .catch((error) => {
            console.log(error);
        });
    return coordinates;
}

async function getCountry(lat, long) {
    let country;
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=ebd8bafbe6ca4c789e27b79926a431c8`;
    await fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.results.length > 0) {
                //const city = data.results[0].components.city;
                country = data.results[0].components.country;
                console.log(country);
            } else {
                console.log("Nicht gut");
            }
        })
        .catch(error => console.log(error));
    return country;
}

//getMapillaryIds(-90,-90,90,90);
//getMapillaryIds(-90,-90,90,90, "randomIds");

app.listen(3000)
console.log("Server now listening on http://localhost:3000/")