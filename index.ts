// Define a place
const place = {
  name: "Stockholm",
  lat: 59.3293,
  lon: 18.0686,
}

//Function that maps weather symbols (numbers) from SMHI API to readable text
const mapWeatherSymbol = (symbol: number): string => { //annotate type and its return
  // Key-value mapping: weather symbol number → description
  const mapping: { [key: number]: string } = { //annotate type and its return
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
  }
  // Return the matching description, or "Unknown" if the symbol isn't in the list
  return mapping[symbol] ?? "Unknown";
};

// Interfaces: These define the shape of data returned by the SMHI API
// Each parameter in the API response (like temperature, wind speed, etc.)
interface SmhiParameter {
  name: string;
  values: number[];
}

// data for a specific timestamp
interface SmhiTimeSeries {
  validTime: string;
  parameters: SmhiParameter[];
}
//Full response object from the SMHI API
interface SmhiResponse {
  timeSeries: SmhiTimeSeries[];
}

interface currentWeather {
  temperature: number
  condition: string;
}

interface Forecast {
  date: string;
  temperature: number;
  condition: string;
}
// The SMHI API endpoint for point forecasts (pmp3g)
const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2` +
  `/geotype/point/lon/${place.lon}/lat/${place.lat}/data.json`;

// Variable to store the current weather once we fetch it
let currentWeather: currentWeather;
console.log(weatherURL)

// Fetch weather data from SMHI API
const fetchWeather = async () => {
  // Fetch the weather JSON data from the SMHI API
  const response = await fetch(weatherURL);
  // If something went wrong (e.g., 404 or 500), throw an error
  if (!response.ok) {
    throw new Error(`Error fetching weather data: ${response.statusText}`);
  }
  // Parse the JSON response and cast it to our SmhiResponse type
  const data: SmhiResponse = await response.json();
  // Get the first time step (usually the current or next available forecast)
  const first = data.timeSeries?.[0];
  // Find the temperature ("t") and weather symbol ("Wsymb2") from parameters
  const temp = first?.parameters.find(p => p.name === "t")?.values[0];
  const symbol = first?.parameters.find(p => p.name === "Wsymb2")?.values[0];

  currentWeather = {
    temperature: temp ?? 0,
    condition: mapWeatherSymbol(symbol ?? 0)
  };

  console.log(currentWeather);
}

fetchWeather();
