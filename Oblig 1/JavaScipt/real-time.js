
let locationData = {
    "London": {
        "latitude": 51.51,
        "longitude": 0.1276
    },
    "Berlin": {
        "latitude": 52.52,
        "longitude": 13.41
    },
    "Paris": {
        "latitude": 48.86,
        "longitude": 2.35
    },
    "Stockholm": {
        "latitude": 59.33,
        "longitude": 18.06
    },
    "Oslo": {
        "latitude": 59.91,
        "longitude": 10.75
    },
}

let HTMLData = {}




const getWeatherData = async(location) => {
    // Fetches a json object with weather data for the given latitude and longitude
    let params = {
        "latitude": locationData[location].latitude,
        "longitude": locationData[location].longitude,
        "current": ["temperature_2m", "relative_humidity_2m", "is_day", "precipitation", "rain", "weather_code", "cloud_cover", "wind_speed_10m", "wind_gusts_10m"],
        "forecast_days": 1,
        "timezone": "auto",
    };
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${params.latitude}&longitude=${params.longitude}&current=${params.current.toString()}&forecast_days=${params.forecast_days}&timezone=${params.timezone}`;

    let response = await fetch(url)
        .then(async responses => {
            if (!responses.ok) {
                throw Error("HTTP error, status: " + responses.status);
            }
            return responses.json();
        })
        .then(data => {
            let current = data.current;
            let currentUnits = data.current_units;


            let weatherData = {}
            weatherData[location] = {
                time: current.time,
                temperature_2m: current.temperature_2m + currentUnits.temperature_2m,
                relative_humidity_2m: current.relative_humidity_2m + currentUnits.relative_humidity_2m,
                is_day: current.is_day === 1 ? "Day" : "Night",
                precipitation: current.precipitation + currentUnits.precipitation,
                rain: current.rain + currentUnits.rain,
                weather_code: current.weather_code,
                cloud_cover: current.cloud_cover + currentUnits.cloud_cover,
                wind_speed_10m: current.wind_speed_10m + currentUnits.wind_speed_10m,
                wind_gusts_10m: current.wind_gusts_10m + currentUnits.wind_gusts_10m,
            }
            return weatherData;
        })
    return response;
}

const makeLocationHTMl = (forecastDiv,id) => {
    // Creates the HTML for a location and returns the header and
    // body elements to be filled with content later.
    /* Layout:
        <div class="location" id="${id}">
            <div class="city"><p>City, Country</p></div>
            <div class="temp"><h2>17°C</h2></div>
            <div class="date"><h2>Wednesday, April 22</h2></div>
            <div class="time"><h2>09:00</h2></div>
        </div>
    */

    //<div class="location" id="${id}">
    let location = document.createElement('div');
    location.classList.add('location');
    location.id = `${id}`;
    forecastDiv.appendChild(location);

    //<div class="city"><p>City, Country</p></div>
    let city = document.createElement('div');
    city.classList.add('city');
    location.appendChild(city);
    let cityText = document.createElement('p');
    cityText.innerText = 'City, Country';
    city.appendChild(cityText);

    //<div class="temp"><h2>17°C</h2></div>
    let temperature = document.createElement('div');
    temperature.classList.add('temp');
    location.appendChild(temperature);
    let temperatureText = document.createElement('h2');
    temperatureText.innerText = '17°C';
    temperature.appendChild(temperatureText);
    

    //<div class="date"><h2>Wednesday, April 22</h2></div>
    let date = document.createElement('div');
    date.classList.add('date');
    location.appendChild(date);
    let dateText = document.createElement('h2');
    dateText.innerText = 'Wednesday, April 22';
    date.appendChild(dateText);

    return [cityText,temperatureText,dateText];
}
let wrap = document.getElementById('wrap');
let forecastDiv = document.createElement('div');
forecastDiv.classList.add('forecast');
wrap.appendChild(forecastDiv);
for (let key in locationData) {
    HTMLData[key] = makeLocationHTMl(forecastDiv,key);
}

const getAllWeatherData = async(locationData) => {
    let weatherData = {};

    return await Promise.all(
        Object.keys(locationData).map(async location => {
            await getWeatherData(location)
            .then(data => {
                let [city,temperature,date] = HTMLData[location];
                city.innerText = location;
                temperature.innerText = data[location].temperature_2m;
                let time = new Date(data[location].time);
                militaryTime = time.toTimeString().split(":");
                date.innerText = militaryTime[0] + ":" + militaryTime[1];
                
                weatherData= {...weatherData, ...data}
            });
        })
    ).then(data => {return weatherData;});
}

const updateWeatherData = async() => {
    let weatherData = await getAllWeatherData(locationData);
    console.log(weatherData);
}

updateWeatherData();
setInterval(updateWeatherData, 30000); // Updates every 30 seconds