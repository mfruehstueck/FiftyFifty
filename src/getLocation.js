let coordinates = document.createElement("p");
let containerHomeView = document.getElementById("geo-location");
containerHomeView.appendChild(coordinates);

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position.coords.latitude, position.coords.longitude);
        let latitude;
        let longitude;
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        coordinates.append("Your current location is: " + latitude + " " + longitude);

        // Map the coordinates to cites and countries:
        const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=ebd8bafbe6ca4c789e27b79926a431c8`;
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    const city = data.results[0].components.city;
                    const country = data.results[0].components.country;
                    coordinates.append(" (City: " + city + ", Country: " + country + ")")
                } else {
                    coordinates.append("No city or country could be found for your coordinates.");
                }
            })
            .catch(error => console.log(error));
    });
} else {
    coordinates.append("Sorry, your geolocation is not available at the moment!")
}



