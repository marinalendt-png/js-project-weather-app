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
// Define a place
const place = {
    name: "Stockholm",
    lat: 59.3293,
    lon: 18.0686,
};
//Function that maps weather symbols (numbers) from SMHI API to readable text
const mapWeatherSymbol = (symbol) => {
    var _a;
    // Key-value mapping: weather symbol number → description
    const mapping = {
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
    // Return the matching description, or "Unknown" if the symbol isn't in the list
    return (_a = mapping[symbol]) !== null && _a !== void 0 ? _a : "Unknown";
};
// The SMHI API endpoint for point forecasts (pmp3g)
const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2` +
    `/geotype/point/lon/${place.lon}/lat/${place.lat}/data.json`;
// Variable to store the current weather once we fetch it
let currentWeather;
console.log(weatherURL);
// Fetch weather data from SMHI API
const fetchWeather = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Fetch the weather JSON data from the SMHI API
    const response = yield fetch(weatherURL);
    // If something went wrong (e.g., 404 or 500), throw an error
    if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
    }
    // Parse the JSON response and cast it to our SmhiResponse type
    const data = yield response.json();
    // Get the first time step (usually the current or next available forecast)
    const first = (_a = data.timeSeries) === null || _a === void 0 ? void 0 : _a[0];
    // Find the temperature ("t") and weather symbol ("Wsymb2") from parameters
    const temp = (_b = first === null || first === void 0 ? void 0 : first.parameters.find(p => p.name === "t")) === null || _b === void 0 ? void 0 : _b.values[0];
    const symbol = (_c = first === null || first === void 0 ? void 0 : first.parameters.find(p => p.name === "Wsymb2")) === null || _c === void 0 ? void 0 : _c.values[0];
    currentWeather = {
        temperature: temp !== null && temp !== void 0 ? temp : 0,
        condition: mapWeatherSymbol(symbol !== null && symbol !== void 0 ? symbol : 0)
    };
    console.log(currentWeather);
});
fetchWeather();
