import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
const app = express();
const port = 4000;

dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let API_KEY = process.env.API_KEY;

app.get("/weather-forecast", async (req, res) => {
  let { city } = req.query;
  const geocodeUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${API_KEY}&q=${city}`;
  console.log("test 1");
  let geoData = [];
  let forecastData = [];
  try {
    const geoResponse = await fetch(geocodeUrl);
    geoData = await geoResponse.json();
    if (geoData.length > 0) {
      const locationKey = geoData[0].Key;
      const forecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${API_KEY}&details=true`;
      const forecastResponse = await fetch(forecastUrl);

      forecastData = await forecastResponse.json();
      forecastData.DailyForecasts = forecastData.DailyForecasts.map((day) => ({
        ...day,
        ForecastMessage: generateForecastMessage(day),  
      }));
    } else {
      return res.status(404).send("No city found.");
    }
  } catch (error) {
    console.error("Error fetching weather data: ", error);
    return res.status(500).send("Error fetching weather data.");
  }
  console.log("end of request");
  res.send({ geoData, forecastData });
});

function generateForecastMessage(day) {
  const { Day } = day;
  if (Day.IconPhrase.includes("Rain"))
    return "Grab your umbrella, it's going to be a wet day!";
  else if (Day.IconPhrase.includes("Snow"))
    return "Wrap up warm, it's going to be a snowy adventure.";
  else if (Day.IconPhrase.includes("Cloudy"))
    return "A grey day ahead, perfect for indoor activities.";
  else if (Day.IconPhrase.includes("Sunny"))
    return "Sun’s out, guns out! Enjoy the clear skies!";
  else if (Day.IconPhrase.includes("Thunderstorms"))
    return "Stay safe, thunderstorms expected today.";
  else if (Day.IconPhrase.includes("Partly sunny"))
    return "A bit of sun and clouds, a light jacket should do.";
  else if (Day.IconPhrase.includes("Mostly cloudy"))
    return "Mostly cloudy skies, keep your spirits bright.";
  else return "Enjoy the day, whatever the weather!";
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
