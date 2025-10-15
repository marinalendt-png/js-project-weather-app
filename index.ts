const place = {
  name: "Stockholm",
  lat: 59.3293,
  lon: 18.0686,
}

const mapWeatherSymbol = (symbol: number): string => {
  const mapping: { [key: number]: string } = {
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
  return mapping[symbol] ?? "Unknown";
};

interface SmhiParameter {
  name: string;
  values: number[];
}

interface SmhiTimeSeries {
  validTime: string;
  parameters: SmhiParameter[];
}

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

//https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${place.lon}/lat/${place.lat}/data.json`;
//https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/18.062639/lat/59.329468/data.json?timeseries=48

const weatherURL = `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/18.062639/lat/59.329468/data.json?timeseries=24`
let currentWeather: currentWeather;

// const weatherURL = ``;

const fetchWeather = async () => {
  const response = await fetch(weatherURL);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data: SmhiResponse = await response.json();
  //const first = data.timeSeries ? [0];
  const first = data.timeSeries[0];
  const temp = first?.parameters.find(p => p.name === "t")?.values[0];
  const symbol = first?.parameters.find(p => p.name === "Wsymb2")?.values[0];

  currentWeather = {
    temperature: temp ?? 0,
    condition: mapWeatherSymbol(symbol ?? 0)
  };

  console.log(currentWeather);
}

fetchWeather();




// const places = [
//   { name: "Stockholm", lat: 59.3293, lon: 18.0686 },
//   { name: "Gothenburg", lat: 57.7089, lon: 11.9746 },
// ]

// const name: string = "Weather App";

// interface WeatherData {
//   temperature: number;
//   city: string;
//   time: string;
//   description: string;
//   icon: string;
//   //forecast: Forecast[];
// }

// const weatherURL = "https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/18.062639/lat/59.329468/data.json?timeseries=24";
// // let mockupData: any[] = [];

// interface currentWeatherData {
//   airTemp: number;
//   condition: string;
// }

// let currentWeather: currentWeatherData

// const fetchWeather = async () => {
//   try {
//     const response = await fetch(weatherURL);

//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//     const data = await response.json();

//     const firstTime = data.timeSeries[0]
//     const temp = firstTime.parameteres.find((p: any) => p.name) === "t").values [0]

//     currentWeather = {
//       airTemp: data.timeSeries[0].data.air_temperature,
//       condition: data.timeSeries[0].data.symbol_code,
//     }

//     console.log(data.timeSeries[0].data);

//   } catch (error) {
//     console.error(`caught an error, ${error}`);
//   }
// };

// fetchWeather();

