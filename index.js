const apiKey = "8221a0f9c3a2e88066c8055a24dcf07b";
const weatherBaseUrl = "https://api.openweathermap.org/data/2.5";
const currentWeatherUrl = `${weatherBaseUrl}/weather`;
const forecastUrl = `${weatherBaseUrl}/forecast`;
const geoLocationUrl = `${weatherBaseUrl}/weather`;

async function fetchCurrentWeather(lat, lon) {
  const apiUrl = `${currentWeatherUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch current weather data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching current weather data:", error);
    return null;
  }
}

async function fetchWeatherForecast(lat, lon) {
  const apiUrl = `${forecastUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch weather forecast data");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather forecast data:", error);
    return null;
  }
}

async function init() {
  const loadingIndicator = document.getElementById("loading-indicator");
  try {
    // Display loading indicator
    loadingIndicator.style.display = "block";

    // Get user's current position
    const position = await getCurrentPosition();
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Fetch and display current weather data for current location
    await fetchAndDisplayWeather(lat, lon);
  } catch (error) {
    console.error("Error getting current location weather data:", error);
    // Handle errors related to geolocation or fetching data
  } finally {
    // Hide loading indicator after data is loaded or error occurs
    loadingIndicator.style.display = "none";
  }
}

async function fetchAndDisplayWeather(lat, lon) {
  try {
    // Fetch current weather data and weather forecast concurrently
    const [currentWeatherData, forecastData] = await Promise.all([
      fetchCurrentWeather(lat, lon),
      fetchWeatherForecast(lat, lon),
    ]);

    // Display current weather data
    if (currentWeatherData) {
      displayCurrentWeather(currentWeatherData);
    }

    // Display weather forecast data
    if (forecastData) {
      displayWeatherForecast(forecastData);
    }
  } catch (error) {
    console.error("Error fetching or displaying weather data:", error);
    // Handle errors related to fetching or displaying data
  }
}

async function getCoordinates(location) {
  const geocodingUrl = `${geoLocationUrl}?q=${location}&appid=${apiKey}`;

  try {
    const response = await fetch(geocodingUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch coordinates for the location");
    }
    const data = await response.json();
    const { coord } = data;
    return coord;
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
}

async function searchWeather() {
  const locationInput = document.getElementById("location-input").value;
  const loadingIndicator = document.getElementById("loading-indicator");

  if (!locationInput) {
    alert("Please enter a location to search.");
    return;
  }

  try {
    // Display loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = "block";
    }

    // Fetch latitude and longitude coordinates for the searched location
    const coordinates = await getCoordinates(locationInput);

    if (coordinates) {
      const { lat, lon } = coordinates;
      // Fetch and display weather data for the searched location
      await fetchAndDisplayWeather(lat, lon);
    } else {
      alert("Location not found. Please try again.");
    }
  } catch (error) {
    console.error("Error searching weather data:", error);
    // Handle errors related to searching weather data
  } finally {
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }
  }
}

function displayCurrentWeather(currentWeatherData) {
  const weatherContainer = document.getElementById("weather-container");
  weatherContainer.innerHTML = ""; // Clear previous content

  const city = currentWeatherData.name;
  const country = currentWeatherData.sys.country;
  const temperature = Math.round(currentWeatherData.main.temp);
  const feelsLike = Math.round(currentWeatherData.main.feels_like);
  const weatherDescription = currentWeatherData.weather[0].description;
  const windSpeed = currentWeatherData.wind.speed;
  const weatherHumidity = currentWeatherData.main.humidity;
  const visibility = currentWeatherData.visibility;
  const sunrise = new Date(currentWeatherData.sys.sunrise * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunset = new Date(currentWeatherData.sys.sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const iconUrl = `https://openweathermap.org/img/wn/${currentWeatherData.weather[0].icon}.png`;

  const weatherElement = document.createElement("div");
  weatherElement.classList.add("weather");

  weatherElement.innerHTML = `
    <div class="location">
      <div>${city}, ${country}</div>
    </div>
    <div class="weather-header">
      <div>Current Weather</div>
    </div>
    <div class="weather-body">
      <div><img src="${iconUrl}" alt="${weatherDescription}"></div>
      <div>${weatherDescription}</div>
      <div>Temperature: ${temperature}°C</div>
      <div>Feels like: ${feelsLike}°C</div>
      <div>Wind Speed: ${windSpeed} m/s</div>
      <div>Humidity: ${weatherHumidity}%</div>
      <div>Visibility: ${visibility} meters</div>
      <div>Sunrise: ${sunrise}</div>
      <div>Sunset: ${sunset}</div>
    </div>
  `;

  weatherContainer.appendChild(weatherElement);
}

function displayWeatherForecast(forecastData) {
  const weatherContainer = document.getElementById("weather-container");

  // Initialize variables for tracking the day and entries per day
  let currentDay = "";
  let daysDisplayed = 0;

  // Loop through the forecast list
  forecastData.list.forEach((forecast) => {
    const date = new Date(forecast.dt * 1000); // Convert timestamp to Date object
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });

    // Check if a new day is encountered
    if (dayOfWeek !== currentDay) {
      currentDay = dayOfWeek;

      // Display forecast for the current day
      if (daysDisplayed < 8) {
        // Adjust this condition based on your requirements
        const weatherDescription = forecast.weather[0].description;
        const temperature = Math.round(forecast.main.temp);
        const feelsLike = Math.round(forecast.main.feels_like);
        const windSpeed = forecast.wind.speed;
        const iconUrl = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

        // Create forecast element for each day's first entry
        const forecastElement = document.createElement("div");
        forecastElement.classList.add("forecast");

        forecastElement.innerHTML = `
          <div class="forecast-header">
            <div>${dayOfWeek}</div>
          </div>
          <div class="forecast-body">
            <div><img src="${iconUrl}" alt="${weatherDescription}"></div>
            <div>${weatherDescription}</div>
            <div>Temperature: ${temperature}°C</div>
            <div>Feels like: ${feelsLike}°C</div>
            <div>Wind Speed: ${windSpeed} m/s</div>
          </div>
        `;

        weatherContainer.appendChild(forecastElement);
        daysDisplayed++; // Increment the displayed day count
      }
    }
  });
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// window.onload = init;
// Call init function when the page loads
document.addEventListener("DOMContentLoaded", init);

// async function init() {
//   try {
//     // Get user's current position
//     const position = await getCurrentPosition();
//     const lat = position.coords.latitude;
//     const lon = position.coords.longitude;

//     // Fetch both current weather data and weather forecast concurrently
//     const [currentWeatherData, forecastData] = await Promise.all([
//       fetchCurrentWeather(lat, lon),
//       fetchWeatherForecast(lat, lon),
//     ]);

//     // Display current weather data
//     if (currentWeatherData) {
//       displayCurrentWeather(currentWeatherData);
//     }

//     // Display weather forecast data
//     if (forecastData) {
//       displayWeatherForecast(forecastData);
//     }
//   } catch (error) {
//     console.error("Error getting weather data:", error);
//     // Handle errors related to geolocation or fetching data
//   }
// }
