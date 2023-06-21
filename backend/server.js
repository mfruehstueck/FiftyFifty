const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const rounds = require("./rounds.js");
const randomIds = require("./randomIds.js");
const northernIds = require("./northernIds.js");
const southernIds = require("./southernIds.js");
// for csv parsing
const fs = require("fs");
const { parse } = require("csv-parse");

// Mapillary token
const mapillaryToken = "MLY|6425749720781602|74d4571106775c1ff773082d77b80f27";

const app = express();

// parse cities from csv-file
const result = [];
fs.createReadStream("./worldcities.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    //console.log(row);
    result.push(row);
  })
  .on("end", () => {
  });

// write Mapillary ids to File

/*
let content = getMapillaryIds(-90,-90,90,90);
content = JSON.stringify(content);

fs.writeFile('./random_IDs', content, err => {
  if (err) {
    console.error(err);
  }
  // file written successfully
});
*/

// Parse urlencoded bodies
app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "..", "src")));
app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("/StreetViewsPls", async function (req, res) {
  let round;
  let questionType = Math.floor(Math.random() * 2);
  if(questionType === 0) {
    round = await generateCountryRound();
  }
  else {
    round = generateHemisphereRound();
  }
  
  res.send(round);
  
  // old
  /*
  let round = Object.values(rounds);
  res.send(round[req.query.round - 1]);
  */
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "src", "main.html"));
});

// POST, PUT, DELETE

app.listen(3000);

console.log("Server now listening on http://localhost:3000/");

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

  if(l == 0) {
    round["id1"] = nId;
    round["id2"] = sId;
    round["correct"] = 2;
  }
  else {
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
  if(shuffle == 0) {
    round["correct"] = 1;
    round["question"] = `Which image is in ${id1Country}?`;
  }
  else {
    round["correct"] = 2;
    round["question"] = `Which image is in ${id2Country}?`;
  }
  // TODO: check if same country
  if(id1Country == id2Country) {
    round["correct"] = 0;
  }
  console.log(round);
  return round;
}

async function generateProximityRound(lat, long) {

}

async function getMapillaryIds(lat1, long1, lat2, long2, fileName) {

  const apiUrl = `https://graph.mapillary.com/images?access_token=${mapillaryToken}&fields=id,computed_geometry&bbox=${long1},${lat1},${long2},${lat2}`;
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
  const apiUrl = `https://graph.mapillary.com/${id}?access_token=${mapillaryToken}`;
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
