import express from "express";

import axios from "axios";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from 'path';
dotenv.config();

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: "true" }));

const API_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_Key = process.env.API_KEY;


console.log("Serving static files from: ", __dirname + "/public");

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Get day and date separately
const getCurrentTime = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Add leading zero if needed
  return `${hours}:${minutes}`;
};

const optionsForDay = { weekday: "long" };
const optionsForDate = { year: "numeric", month: "long", day: "numeric" };

// Function to convert Unix time to local time based on timezone offset
const convertUnixTime = (unixTime, timezoneOffset) => {
  const date = new Date((unixTime + timezoneOffset) * 1000); // Convert to milliseconds
  const hours = date.getUTCHours();
  const minutes = "0" + date.getUTCMinutes();
  const formattedTime = hours + ":" + minutes.substr(-2);
  return formattedTime;
};

// Switch case for big icons
const getBigIcon = (main) => {
  switch (main.toLowerCase()) {
    case "rain":
      return "/images/storm.png";
    case "clouds":
      return "/images/cloudy (6).png";
    case "clear":
      return "/images/sun.png";
    case "haze":
    case "mist":
      return "/images/haze.png";
    case "drizzle":
      return "/images/cloud_15089622.png";
    case "snow":
      return "/images/snow.png";
    default:
      return "/images/sunny.png";
  }
};

// Switch case for background images
const getBackgroundImage = (main) => {
  switch (main.toLowerCase()) {
    case "rain":
      return "/images/lKD.gif";
    case "clouds":
      return "/images/cloud.gif";
    case "clear":
      return "/images/clear.gif";
    case "mist":
      return "/images/mist.gif";
    case "drizzle":
      return "/images/weather.gif";
    case "snow":
      return "/images/snow1.gif";
    case "thunderstorm":
      return "/images/KNUi.gif";
    case "haze":
      return "/images/haze2.gif";
    default:
      return "/images/clr.gif";
  }
};

// Function to get map image URL based on the weather condition
const getMapImageURL = (main) => {
  switch (main.toLowerCase()) {
    case "rain":
      return "/images/Kawaii Anime Sticker - Kawaii Anime Storm - Discover & Share GIFs.gif";
    case "clouds":
      return "/images/cloudcat.gif";
    case "clear":
      return "/images/output-onlinegiftools (2).gif";
    case "mist":
      return "/images/output-onlinegiftools.gif";
    case "drizzle":
      return "/images/rain3.gif";
    case "snow":
      return "/images/thund-unscreen.gif";
    case "thunderstorm":
      return "/images/thund-unscreen.gif";
    case "haze":
      return "/images/output-onlinegiftools (3).gif";
    default:
      return "/images/other.gif";  // Default image if no match
  }
};

const getWeatherDescription = (main) => {
  switch (main.toLowerCase()) {
    case "rain":
      return "Heavy Showers";
    case "clouds":
      return "Partly Cloudy";
    case "clear":
      return "Sunny Day";
    case "mist":
      return "Foggy Conditions";
    case "drizzle":
      return "Light Rain";
    case "snow":
      return "Snowy Weather";
    case "thunderstorm":
      return "Stormy Skies";
    case "haze":
      return "Hazy Skies";
    default:
      return "Mild Weather";
  }
};

const getHealthTip = (main) => {
  switch (main.toLowerCase()) {
    case "rain":
    case "drizzle":
      return " Health Tip: Don't forget your umbrella today! ☔";
    case "clouds":
      return " Health Tip: Keep an eye on the sky, it might rain later!";
    case "clear":
      return " Health Tip: Wear sunscreen to protect your skin! ☀️";
    case "mist":
      return " Health Tip: Drive carefully in the mist! 🚗";
    case "snow":
      return " Health Tip: Wear warm clothes and be cautious on slippery roads! ⛄";
    default:
      return " Health Tip: Stay prepared for any weather! 😏";
  }
};

// GET request handler for rendering the weather data
app.get("/", async (req, res) => {
  const place = req.query.city || "Delhi"; // Default to "Delhi" if no query parameter is provided
  const date = new Date();
  const day = date.toLocaleDateString("en-IN", optionsForDay);
  const currentDate = date.toLocaleDateString("en-IN", optionsForDate);
  const currentTime = getCurrentTime(); // Get current time (hour:minute)
  let errorMessage = ""; // Variable to store error message if city is invalid

  try {
    const response = await axios.get(API_URL, {
      params: {
        q: place,
        appid: API_Key,
        units: "metric",
      },
    });

    const responseData = response.data;
    const temperature = responseData.main.temp;
    const weatherMain = responseData.weather[0].main;
    const weatherDescription = getWeatherDescription(weatherMain);
    const healthTip = getHealthTip(weatherMain);
    const bigIcon = getBigIcon(weatherMain); // Get the big icon for the weather
    const backgroundImage = getBackgroundImage(weatherMain); // Get the background image for the weather
    const mapImageURL = getMapImageURL(weatherMain);
    const timezoneOffset = responseData.timezone;
    const sunriseTime = convertUnixTime(responseData.sys.sunrise, timezoneOffset);
    const sunsetTime = convertUnixTime(responseData.sys.sunset, timezoneOffset);
    const visibilitySpeed = responseData.visibility / 1000;

    res.render("index", {
      day: day,
      date: currentDate,
      time: currentTime,  // Pass the current time (hour:minute) to the view
      temp: temperature,
      smallIcon: responseData.weather[0].icon,
      bigIcon: bigIcon, // Pass the big icon to the view
      backgroundImage: backgroundImage, // Pass the background image to the view
      healthTip: healthTip,
      cloudiness: responseData.clouds.all,
      weatherDescription: weatherDescription,
      desc: responseData.weather[0].description,
      place: responseData.name,
      mapImageURL,
      main: responseData.weather[0].main,
      country: responseData.sys.country,
      minTemp: responseData.main.temp_min,
      maxTemp: responseData.main.temp_max,
      windStatus: responseData.wind.speed,
      sunriseTime: sunriseTime,
      sunsetTime: sunsetTime,
      humidity: responseData.main.humidity,
      pressure: responseData.main.pressure,
      visibility: visibilitySpeed,
      content: `Weather data for ${place}`,
      errorMessage: errorMessage // No error message by default
    });
  } catch (error) {

    // Check if the error is due to an invalid location (404)
    if (error.response && error.response.status === 404) {
      errorMessage = "Please type the correct name of the city and country."; // Set the error message

      // Redirect to the same page, but show valid data and error message
      const defaultCity = "Delhi"; // Use a default city (or previously entered valid city)
      const response = await axios.get(API_URL, {
        params: {
          q: defaultCity,
          appid: API_Key,
          units: "metric",
        },
      });

      const responseData = response.data;
      const temperature = responseData.main.temp;
      const weatherMain = responseData.weather[0].main;
      const weatherDescription = getWeatherDescription(weatherMain);
      const healthTip = getHealthTip(weatherMain);
      const bigIcon = getBigIcon(weatherMain);
      const backgroundImage = getBackgroundImage(weatherMain);
      const mapImageURL = getMapImageURL(weatherMain);
      const timezoneOffset = responseData.timezone;
      const sunriseTime = convertUnixTime(responseData.sys.sunrise, timezoneOffset);
      const sunsetTime = convertUnixTime(responseData.sys.sunset, timezoneOffset);
      const visibilitySpeed = responseData.visibility / 1000;

      // Render the page with the default city's data and error message
      res.render("index", {
        day: day,
        date: currentDate,
        time: currentTime,
        temp: temperature,
        smallIcon: responseData.weather[0].icon,
        bigIcon: bigIcon,
        backgroundImage: backgroundImage,
        healthTip: healthTip,
        cloudiness: responseData.clouds.all,
        weatherDescription: weatherDescription,
        desc: responseData.weather[0].description,
        place: responseData.name,
        mapImageURL,
        main: responseData.weather[0].main,
        country: responseData.sys.country,
        minTemp: responseData.main.temp_min,
        maxTemp: responseData.main.temp_max,
        windStatus: responseData.wind.speed,
        sunriseTime: sunriseTime,
        sunsetTime: sunsetTime,
        humidity: responseData.main.humidity,
        pressure: responseData.main.pressure,
        visibility: visibilitySpeed,
        content: `Weather data for ${defaultCity}`,
        errorMessage: errorMessage // Display error message to the user
      });
    } else {
      res.render("index", { content: "Oops! Something went wrong. Please try again.", temp: null });
    }
  }
});

app.post("/", (req, res) => {
  const place = req.body.searchbar;
  if (!place || place.trim() === "") {
    // If no place is entered, redirect to Delhi's weather
    return res.redirect(`/?city=Delhi`);
  }
  // Redirect to the same page with the city as a query parameter (Post-Redirect-Get pattern)
  res.redirect(`/?city=${place}`);
});


// Starting the server
app.listen(port, ()=>{
  console.log(`server is running on localhost:${port}`);
  
})