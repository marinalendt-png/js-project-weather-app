/*------------------------------------ 
  INTERFACES
 --------------------------------------*/
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
]

/*------------------------------------ 
  DOM ELEMENTS
 --------------------------------------*/
const city = document.getElementById("city") as HTMLElement;
const temperature = document.getElementById("temp") as HTMLElement;
const time = document.getElementById("time") as HTMLElement;
const description = document.getElementById("desc") as HTMLElement;
const forecast = document.getElementById("forecast") as HTMLUListElement;
const weatherIcon = document.getElementById("weather-icon") as HTMLImageElement;
const nextCityBtn = document.getElementById("next-city-btn") as HTMLButtonElement;
const contentHolder = document.querySelector(".content") as HTMLElement; //first

/*------------------------------------ 
  SYMBOL CODE MAPPING
 --------------------------------------*/
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

const fetchWeather = async () => {
  const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${place.lon}/lat/${place.lat}/data.json`;

  // ---- Fetch the weather JSON data from the SMHI API
  const response = await fetch(weatherURL);
  if (!response.ok) {
    alert("Failed to fetch weather data for this location.");
  }

  // ---- Parse the JSON response and cast it to our SmhiResponse type
  const data: ApiResponse = await response.json();
  const currentTimeWeather: TimeSeries = data?.timeSeries[0];
  const temp = Math.round(currentTimeWeather.data.air_temperature);
  const symbol = currentTimeWeather.data.symbol_code;
  const symbolDescription = symbolCodeMap[symbol] ?? "Unknown"; // fallback if code not found

  // ---- Update current city & temperature in the UI
  city.textContent = place.name;
  temperature.textContent = `${temp}`;

  // ---- Format and display the current time
  let currentHours = new Date().getHours().toLocaleString();
  currentHours = ("0" + currentHours).slice(-2);
  let currentMinutes = new Date().getMinutes().toLocaleString();
  currentMinutes = ("0" + currentMinutes).slice(-2);
  time.textContent = `Time: ${currentHours}:${currentMinutes} `; //Date requirement

  description.textContent = symbolDescription;  // ---- Update textual weather description

  // Choose day/night icon set and optionally switch to dark theme
  const isItDayTime = currentHours >= "06" && currentHours <= "18";
  if (isItDayTime) {
    weatherIcon.src = `./weather_icons/centered/solid/day/${("0" + symbol.toString()).slice(-2)}.svg`;
  } else {
    contentHolder.className = "content-dark";
    weatherIcon.src = `./weather_icons/centered/solid/night/${("0" + symbol.toString()).slice(-2)}.svg`;
  }

  /*------------------------------------ 
    FORECAST RENDERING
 --------------------------------------*/
  const now = new Date(); // current time
  const cutoff = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // today and the next five days
  const forecastData: forecastData[] = data.timeSeries.filter(ts => new Date(ts.time) <= cutoff);

  let fiveDaysForecast = forecastData.map((dayForecast: forecastData) => {
    const forecastDate = new Date(dayForecast.time);
    const today = new Date (now.getFullYear(), now.getMonth(), now.getDate());
  
    if (forecastDate >= new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
      if (forecastDate.getUTCHours() === 12) {
        return {
          day: dayNames [forecastDate.getUTCDay()].substring(0, 3),
          temperature: Math.round(dayForecast.data.air_temperature),
          weatherIcon: `./weather_icons/centered/solid/${isItDayTime ? 'day' : 'night'}/${("0" + dayForecast.data.symbol_code.toString()).slice(-2)}.svg`,
          windSpeed: dayForecast.data.wind_speed
        };
      }
    }
    return undefined;
  }); 

  fiveDaysForecast = fiveDaysForecast.filter(a => a !== undefined);  // Remove undefined entries (days where no 12:00 UTC record was found)

  // Clear and append forecast items as <ul> elements
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