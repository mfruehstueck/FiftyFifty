if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const path = require('path');
const randomIds = require("./randomIds.js");
const northernIds = require("./northernIds.js");
const southernIds = require("./southernIds.js");
// for csv parsing
const fs = require("fs");

const app = express();

const sessions = require("express-session");
const cookieParser = require("cookie-parser");


// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, '..', 'src')));

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

// // parse cities from csv-file
// const result = [];
// fs.createReadStream("./worldcities.csv")
//     .pipe(parse({delimiter: ",", from_line: 2}))
//     .on("data", function (row) {
//         result.push(row);
//     })
//     .on("end", () => {
//     });

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
        if (tmpUser.game.round < 0 || req.header("roundIdx") < 0) {
            console.log("START");
            tmpUser.game.round = 0;
            tmpUser.game.score = 0;
            if (tmpUser.game.type === 0) {
                currentRound.roundTime = 0;
            } else if (tmpUser.game.type === 1) {
                currentRound.roundTime = tmpUser.gameSettings.roundTime;
            } else if (tmpUser.game.type === 2) {
                currentRound.roundTime = tmpUser.gameSettings.roundTimeFast;
            }

        } else if (tmpUser.game.round >= tmpUser.gameSettings.maxRounds) {
            console.log("WON");

            if (tmpUser.game.score > tmpUser.highscore) tmpUser.highscore = tmpUser.game.score;
            tmpUser.game.round = -1;

            currentRound.currentScore = tmpUser.game.score;

            updateLeaderboard();
        } else {
            if (tmpUser.game.round >= tmpUser.gameSettings.maxRounds - 1) currentRound.gameWon = true;
            console.log("NEXT");
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

    // type
    // 0...default
    // 1...time
    // 2...timeFast
    game: {
        round: -1,
        type: 0,
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
    return getUser(checkSession.username);
}

app.get("/sessionUser", (req, res) => {
    session = req.session;
    console.log("currentSession: " + session.username);
    res.status(200).send(JSON.stringify(getUserWithSession(session)));
});

app.get("/countryCodes", (req, res) => {
    res.send(["nop", "United States", "Canada", "Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and/or Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecudaor", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France, Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kosovo", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfork Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia South Sandwich Islands", "South Sudan", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbarn and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States minor outlying islands", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City State", "Venezuela", "Vietnam", "Virigan Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zaire", "Zambia", "Zimbabwe"]);
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
    res.redirect("/");
    return res.sendStatus(204);
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