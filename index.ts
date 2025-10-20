//Full response object from the SMHI API//
interface ApiResponse {
  timeSeries: TimeSeries[];
}
interface TimeSeries {
  data: Data;
  time: string;
}
interface Data {
  air_temperature: number;
  symbol_code: number;
  wind_speed: number;
}
interface forecastData {
  time: string;
  data: Data;
}
// Define a place
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
]

const city = document.getElementById("city") as HTMLElement;
const temperature = document.getElementById("temp") as HTMLElement;
const time = document.getElementById("time") as HTMLElement;
const description = document.getElementById("desc") as HTMLElement;
const forecast = document.getElementById("forecast") as HTMLUListElement;
const weatherIcon = document.getElementById("weather-icon") as HTMLImageElement;
const nextCityBtn = document.getElementById("next-city-btn") as HTMLButtonElement;
const contentHolder = document.querySelector(".content") as HTMLElement; //first

//Function that maps weather symbols (numbers) from SMHI API to readable text
// const mapWeatherSymbol = (symbol: number): string => { //annotate type and its return
// Key-value mapping: weather symbol number → description
//   const mapping: { [key: number]: string } = { //annotate type and its return
//     1: "Clear sky",
//     2: "Nearly clear sky",
//     3: "Variable cloudiness",
//     4: "Halfclear sky",
//     5: "Cloudy sky",
//     6: "Overcast",
//     7: "Fog",
//     8: "Light rain showers",
//     9: "Moderate rain showers",
//     10: "Heavy rain showers",
//     11: "Thunderstorm",
//     12: "Light sleet showers",
//     13: "Moderate sleet showers",
//     14: "Heavy sleet showers",
//     15: "Light snow showers",
//     16: "Moderate snow showers",
//     17: "Heavy snow showers",
//     18: "Light rain",
//     19: "Moderate rain",
//     20: "Heavy rain",
//     21: "Thunder",
//     22: "Light sleet",
//     23: "Moderate sleet",
//     24: "Heavy sleet",
//     25: "Light snow",
//     26: "Moderate snow",
//     27: "Heavy snow",
//   }
//   // Return the matching description, or "Unknown" if the symbol isn't in the list
//   return mapping[symbol] ?? "Unknown";
// };
//description
const symbolCodeMap: any = {
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
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// The SMHI API endpoint for point forecasts (pmp3g)
/*const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2` +
  `/geotype/point/lon/${place.lon}/lat/${place.lat}/data.json`;*/
const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/18.062639/lat/59.329468/data.json`;
// Variable to store the current weather once we fetch it
//let currentWeather: currentWeather;
// Fetch weather data from SMHI API
let currentCityIndex = 0;
let place = places[currentCityIndex];
const fetchWeather = async () => {
  // Fetch the weather JSON data from the SMHI API
  const response = await fetch(weatherURL);
  // If something went wrong (e.g., 404 or 500), throw an error
  if (!response.ok) {
    alert("Failed to fetch weather data for this location.");
  }
  // Parse the JSON response and cast it to our SmhiResponse type
  const data: ApiResponse = await response.json();
  // Get the first time step (usually the current or next available forecast)
  const currentTimeWeather: TimeSeries = data?.timeSeries[0];
  const temp = currentTimeWeather.data.air_temperature;
  const symbol = currentTimeWeather.data.symbol_code;
  const symbolDescription = symbolCodeMap[symbol] ?? "Unknown"; //description
  // Find the temperature ("t") and weather symbol ("Wsymb2") from parameters
  // const temp = currentTimeWeather?.parameters.find(p => p.name === "t")?.values[0];
  // const symbol = currentTimeWeather?.parameters.find(p => p.name === "Wsymb2")?.values[0];
  // currentWeather = {
  //   temperature: temp ?? 0,
  //   //condition: mapWeatherSymbol(symbol ?? 0)
  // };

  city.textContent = place.name;
  temperature.textContent = `${temp} °C`;

  let currentHours = new Date().getHours().toLocaleString();
  currentHours = ("0" + currentHours).slice(-2);
  let currentMinutes = new Date().getMinutes().toLocaleString();
  currentMinutes = ("0" + currentMinutes).slice(-2);
  time.textContent = `Time: ${currentHours}:${currentMinutes} `; //Date requirement

  description.textContent = symbolDescription; //description requirement

  const isItDayTime = currentHours >= "06" && currentHours <= "18";
  if (isItDayTime) {
    weatherIcon.src = `./weather_icons/centered/solid/day/0${symbol.toString().slice(-2)}.svg`;
  } else {
    contentHolder.className = "content-dark";
    weatherIcon.src = `./weather_icons/centered/solid/night/0${symbol.toString().slice(-2)}.svg`;
  }

  const now = new Date(); // current time
  const cutoff = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
  const forecastData: forecastData[] = data.timeSeries.filter(ts => new Date(ts.time) <= cutoff);

  let fiveDaysForecast = forecastData.map((dayForecast: forecastData) => {
    if (now.getDate() + 1 < new Date(dayForecast.time).getDate() + 1) {
      if (new Date(dayForecast.time).getUTCHours() === 12) {
        if (dayForecast !== undefined) {
          console.log("dayForecast ", ("0" + dayForecast.data.symbol_code.toString()).slice(-2));
          return {
            day: dayNames[new Date(dayForecast.time).getUTCDay()].substring(0,3),
            temperature: dayForecast.data.air_temperature,
            weatherIcon: `./weather_icons/centered/solid/${isItDayTime ? 'day' : 'night'}/${("0" + dayForecast.data.symbol_code.toString()).slice(-2)}.svg`,
            windSpeed: dayForecast.data.wind_speed
          };
        }
      }
      return;
    }
  });
  fiveDaysForecast = fiveDaysForecast.filter(a => a !== undefined);
  forecast.innerHTML = ""; // Clear previous forecast entries
  fiveDaysForecast.forEach((dayForecast) => {
    const listItem = document.createElement("ul");
    listItem.innerHTML = `
      <p>${dayForecast?.day}</p>
      <img src="${dayForecast?.weatherIcon}" alt="Weather icon" />
      <p>${dayForecast?.temperature} °C</p>
      <p>${dayForecast?.windSpeed} m/s</p>
    `;
    forecast.appendChild(listItem);
  });






}
// will be used in future development for searched locations
const getSearchedLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("Latitude: " + position.coords.latitude +
        " Longitude: " + position.coords.longitude);
    });
  }
  else {
    alert("Geolocation is not supported by this browser or please allow location access.");
  }
}
nextCityBtn.addEventListener("click", () => {
  currentCityIndex = (currentCityIndex + 1) % places.length;
  place = places[currentCityIndex];
  fetchWeather();
});

fetchWeather();
getSearchedLocation();








// // Interfaces: These define the shape of data returned by the SMHI API

// // Each parameter in the API response (like temperature, wind speed, etc.)
// interface SmhiParameter {
//   name: string;
//   values: number[];
// }

// // data for a specific timestamp
// interface SmhiTimeSeries {
//   validTime: string;
//   parameters: SmhiParameter[];
// }

// //Full response object from the SMHI API
// interface SmhiResponse {
//   timeSeries: SmhiTimeSeries[];
// }

// interface currentWeather {
//   temperature: number
//   condition: string;
// }

// interface Forecast {
//   date: string;
//   temperature: number;
//   condition: string;
// }

// // Define a place
// const place = {
//   name: "Stockholm",
//   lat: 59.3293,
//   lon: 18.0686,
// }

// const city = document.getElementById("city") as HTMLElement;
// const temperature = document.getElementById("temp") as HTMLElement;
// const description = document.getElementById("desc") as HTMLElement;
// const forecast = document.getElementById("forecast") as HTMLUListElement;
// const contentHolder = document.querySelector(".content") as HTMLElement;
// //const contentHolder = document.querySelector('.current-weather');


// //Function that maps weather symbols (numbers) from SMHI API to readable text
// const mapWeatherSymbol = (symbol: number): string => { //annotate type and its return
//   // Key-value mapping: weather symbol number → description
//   const mapping: { [key: number]: string } = { //annotate type and its return
//     1: "Clear sky",
//     2: "Nearly clear sky",
//     3: "Variable cloudiness",
//     4: "Halfclear sky",
//     5: "Cloudy sky",
//     6: "Overcast",
//     7: "Fog",
//     8: "Light rain showers",
//     9: "Moderate rain showers",
//     10: "Heavy rain showers",
//     11: "Thunderstorm",
//     12: "Light sleet showers",
//     13: "Moderate sleet showers",
//     14: "Heavy sleet showers",
//     15: "Light snow showers",
//     16: "Moderate snow showers",
//     17: "Heavy snow showers",
//     18: "Light rain",
//     19: "Moderate rain",
//     20: "Heavy rain",
//     21: "Thunder",
//     22: "Light sleet",
//     23: "Moderate sleet",
//     24: "Heavy sleet",
//     25: "Light snow",
//     26: "Moderate snow",
//     27: "Heavy snow",
//   }
//   // Return the matching description, or "Unknown" if the symbol isn't in the list
//   return mapping[symbol] ?? "Unknown";
// };


// // The SMHI API endpoint for point forecasts (pmp3g)
// const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2` +
//   `/geotype/point/lon/${place.lon}/lat/${place.lat}/data.json`;

// // Variable to store the current weather once we fetch it
// let currentWeather: currentWeather;
// console.log(weatherURL)

// // Fetch weather data from SMHI API
// const fetchWeather = async () => {
//   // Fetch the weather JSON data from the SMHI API
//   const response = await fetch(weatherURL);
//   // If something went wrong (e.g., 404 or 500), throw an error
//   if (!response.ok) {
//     throw new Error(`Error fetching weather data: ${response.statusText}`);
//   }
//   // Parse the JSON response and cast it to our SmhiResponse type
//   const data: SmhiResponse = await response.json();
//   // Get the first time step (usually the current or next available forecast)
//   const first = data?.timeSeries[0];
//   // Find the temperature ("t") and weather symbol ("Wsymb2") from parameters
//   const temp = first?.parameters.find(p => p.name === "t")?.values[0];
//   const symbol = first?.parameters.find(p => p.name === "Wsymb2")?.values[0];

//   currentWeather = {
//     temperature: temp ?? 0,
//     condition: mapWeatherSymbol(symbol ?? 0)
//   };

//   city.textContent = "Stockholm"
//   temperature.textContent = `${currentWeather.temperature} °C`
//   description.textContent = currentWeather.condition

//   console.log(currentWeather);
// }

// fetchWeather();
