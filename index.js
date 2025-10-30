"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*------------------------------------
  STATIC PLACES
 --------------------------------------*/
const places = [
    {
        name: "Stockholm",
        lat: 59.32944,
        lon: 18.06861,
    },
    {
        name: "Göteborg",
        lat: 57.70887,
        lon: 11.97456,
    },
    {
        name: "Lund",
        lat: 55.7058,
        lon: 13.1932,
    },
    {
        name: "Linköping",
        lat: 58.4109,
        lon: 15.6216,
    },
    {
        name: "Umeå",
        lat: 63.82585,
        lon: 20.26304,
    },
    {
        name: "Vittangi",
        lat: 67.678642,
        lon: 21.641315,
    },
    {
        name: "Treriksröset",
        lat: 69.059966,
        lon: 20.548735,
    }
];
/*------------------------------------
  DOM ELEMENTS
 --------------------------------------*/
const city = document.getElementById("city");
const temperature = document.getElementById("temp");
const time = document.getElementById("time");
const description = document.getElementById("desc");
const forecast = document.getElementById("forecast");
const weatherIcon = document.getElementById("weather-icon");
const nextCityBtn = document.getElementById("next-city-btn");
const contentHolder = document.querySelector(".content"); //first
/*------------------------------------
  SYMBOL CODE MAPPING
 --------------------------------------*/
const symbolCodeMap = {
    1: "Clear sky",
    2: "Nearly clear sky",
    3: "Variable cloudiness",
    4: "Halfclear sky",
    5: "Cloudy sky",
    6: "Overcast",
    7: "Fog",
    8: "Light rain showers",
    9: "Moderate rain showers",
    10: "Heavy rain showers",
    11: "Thunderstorm",
    12: "Light sleet showers",
    13: "Moderate sleet showers",
    14: "Heavy sleet showers",
    15: "Light snow showers",
    16: "Moderate snow showers",
    17: "Heavy snow showers",
    18: "Light rain",
    19: "Moderate rain",
    20: "Heavy rain",
    21: "Thunder",
    22: "Light sleet",
    23: "Moderate sleet",
    24: "Heavy sleet",
    25: "Light snow",
    26: "Moderate snow",
    27: "Heavy snow",
};
/*------------------------------------
  CONSTANS / HELPERS
 --------------------------------------*/
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// ---- Keep track of which city is currently shown
let currentCityIndex = 0;
let place = places[currentCityIndex];
/*------------------------------------
  FETCH & DISPLAY WEATHER
 --------------------------------------*/
const fetchWeather = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${place.lon}/lat/${place.lat}/data.json`;
    // ---- Fetch the weather JSON data from the SMHI API
    const response = yield fetch(weatherURL);
    if (!response.ok) {
        alert("Failed to fetch weather data for this location.");
    }
    // ---- Parse the JSON response and cast it to our SmhiResponse type
    const data = yield response.json();
    const currentTimeWeather = data === null || data === void 0 ? void 0 : data.timeSeries[0];
    const temp = Math.round(currentTimeWeather.data.air_temperature);
    const symbol = currentTimeWeather.data.symbol_code;
    const symbolDescription = (_a = symbolCodeMap[symbol]) !== null && _a !== void 0 ? _a : "Unknown"; // fallback if code not found
    // ---- Update current city & temperature in the UI
    city.textContent = place.name;
    temperature.textContent = `${temp}`;
    // ---- Format and display the current time
    let currentHours = new Date().getHours().toLocaleString();
    currentHours = ("0" + currentHours).slice(-2);
    let currentMinutes = new Date().getMinutes().toLocaleString();
    currentMinutes = ("0" + currentMinutes).slice(-2);
    time.textContent = `Time: ${currentHours}:${currentMinutes} `; //Date requirement
    description.textContent = symbolDescription; // ---- Update textual weather description
    // Choose day/night icon set and optionally switch to dark theme
    const isItDayTime = currentHours >= "06" && currentHours <= "18";
    if (isItDayTime) {
        weatherIcon.src = `./weather_icons/centered/solid/day/${("0" + symbol.toString()).slice(-2)}.svg`;
    }
    else {
        contentHolder.className = "content-dark";
        weatherIcon.src = `./weather_icons/centered/solid/night/${("0" + symbol.toString()).slice(-2)}.svg`;
    }
    /*------------------------------------
      FORECAST RENDERING
   --------------------------------------*/
    const now = new Date(); // current time
    const cutoff = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // today and the next five days
    const forecastData = data.timeSeries.filter(ts => new Date(ts.time) <= cutoff);
    let fiveDaysForecast = forecastData.map((dayForecast) => {
        const forecastDate = new Date(dayForecast.time);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (forecastDate >= new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
            if (forecastDate.getUTCHours() === 12) {
                return {
                    day: dayNames[forecastDate.getUTCDay()].substring(0, 3),
                    temperature: Math.round(dayForecast.data.air_temperature),
                    weatherIcon: `./weather_icons/centered/solid/${isItDayTime ? 'day' : 'night'}/${("0" + dayForecast.data.symbol_code.toString()).slice(-2)}.svg`,
                    windSpeed: dayForecast.data.wind_speed
                };
            }
        }
        return undefined;
    });
    // Select entries for midday (12:00 UTC) only
    let fiveDaysForecast1 = forecastData.map((dayForecast) => {
        if (now.getDate() + 1 < new Date(dayForecast.time).getDate() + 1) { // Ensure the item is in the future (beyond "today")
            if (new Date(dayForecast.time).getUTCHours() === 12) { // Select the midday (12:00 UTC) record for that day
                if (dayForecast !== undefined) {
                    return {
                        day: dayNames[new Date(dayForecast.time).getUTCDay()].substring(0, 3),
                        temperature: Math.round(dayForecast.data.air_temperature), //Round to no decimals
                        weatherIcon: `./weather_icons/centered/solid/${isItDayTime ? 'day' : 'night'}/${("0" + dayForecast.data.symbol_code.toString()).slice(-2)}.svg`,
                        windSpeed: dayForecast.data.wind_speed
                    };
                }
            }
            return;
        }
    });
    fiveDaysForecast = fiveDaysForecast.filter(a => a !== undefined); // Remove undefined entries (days where no 12:00 UTC record was found)
    // Clear and append forecast items as <ul> elements
    forecast.innerHTML = ""; // Clear previous forecast entries
    fiveDaysForecast.forEach((dayForecast) => {
        const listItem = document.createElement("ul");
        listItem.innerHTML = `
      <p>${dayForecast === null || dayForecast === void 0 ? void 0 : dayForecast.day}</p>
      <img src="${dayForecast === null || dayForecast === void 0 ? void 0 : dayForecast.weatherIcon}" alt="Weather icon" />
      <p>${dayForecast === null || dayForecast === void 0 ? void 0 : dayForecast.temperature} °C</p>
      <p>${dayForecast === null || dayForecast === void 0 ? void 0 : dayForecast.windSpeed} m/s</p>
    `;
        forecast.appendChild(listItem);
    });
});
/*------------------------------------
  BUTTON EVENTS
--------------------------------------*/
// When user clicks the next city button, show the next place
nextCityBtn.addEventListener("click", () => {
    currentCityIndex = (currentCityIndex + 1) % places.length;
    place = places[currentCityIndex];
    fetchWeather();
});
/*------------------------------------
  INITIALIZATION
--------------------------------------*/
// Load first city's weather on page load
fetchWeather();
