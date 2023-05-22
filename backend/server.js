const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const rounds = require("./rounds.js");

const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json()); 

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, '..', 'src')));
//app.use(express.static(path.join(__dirname, '...', 'dist', 'main.js')));

app.get("/StreetViewsPls", function (req, res) {
  let round = Object.values(rounds);
  console.log(round[req.query.round - 1]);
  res.send(round[req.query.round - 1]);
})

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'src', 'main.html'));
});

app.listen(3000)

console.log("Server now listening on http://localhost:3000/")