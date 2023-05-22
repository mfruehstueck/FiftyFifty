let latitude;
let longitude;

let coordinates = document.createElement("p");
let containerHomeView = document.getElementById("home-view");
containerHomeView.appendChild(coordinates);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            //console.log(position.coords.latitude, position.coords.longitude);
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
            coordinates.append("Your current location is: " + latitude + " " + longitude);      
        });
    } else {
    coordinates.append("Sorry, your geolocation is not available at the moment!")
    }