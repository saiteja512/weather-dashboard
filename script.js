const weatherDiv = document.getElementById("weather");
const forecastDiv = document.getElementById("forecast");
const forecast3dayDiv = document.getElementById("forecast3day");
const searchBtn = document.getElementById("searchBtn");
const toggleModeBtn = document.getElementById("toggleMode");

let hourlyData = [], dailyData = [];

toggleModeBtn.addEventListener("click", () => document.body.classList.toggle("dark"));
searchBtn.addEventListener("click", () => {
  const city = document.getElementById("cityInput").value;
  if(!city) return alert("Please enter a city name!");
  getCoordinates(city);
});

function getCoordinates(city) {
  fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`)
    .then(res => res.json())
    .then(data => {
      if (!data.results || data.results.length === 0) return alert("City not found!");
      const { latitude, longitude, name, country } = data.results[0];
      getWeather(latitude, longitude, name, country);
    })
    .catch(() => alert("Error fetching city data."));
}

function getWeather(lat, lon, cityName, country) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto`;
  
  fetch(url)
    .then(res => res.json())
    .then(data => {
      displayCurrentWeather(data.current_weather, cityName, country);
      hourlyData = data.hourly;
      dailyData = data.daily;
      displayHourlyForecast(hourlyData);
      display3DayForecast(dailyData);
    })
    .catch(() => alert("Error fetching weather data."));
}

function displayCurrentWeather(current, city, country) {
  const iconUrl = getWeatherIcon(current.weathercode);
  weatherDiv.innerHTML = `
    <h2>${city}, ${country}</h2>
    <img class="weather-icon" src="${iconUrl}" alt="Weather icon">
    <p>🌡️ Temperature: ${current.temperature}°C</p>
    <p>💨 Wind: ${current.windspeed} m/s</p>
  `;
}

function displayHourlyForecast(hourly) {
  forecastDiv.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    const block = document.createElement("div");
    block.classList.add("forecast-hour");
    const time = hourly.time[i].split("T")[1];
    const temp = hourly.temperature_2m[i];
    const iconUrl = getWeatherIcon(hourly.weathercode[i]);
    block.innerHTML = `
      <p>${time}</p>
      <img class="weather-icon" src="${iconUrl}" alt="icon">
      <p>${temp}°C</p>
    `;
    forecastDiv.appendChild(block);
  }
}

function display3DayForecast(daily) {
  forecast3dayDiv.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const block = document.createElement("div");
    block.classList.add("forecast-day");
    const date = new Date(daily.time[i]).toDateString().split(" ")[0];
    const minTemp = daily.temperature_2m_min[i];
    const maxTemp = daily.temperature_2m_max[i];
    const iconUrl = getWeatherIcon(daily.weathercode[i]);
    block.innerHTML = `
      <p><strong>${date}</strong></p>
      <img class="weather-icon" src="${iconUrl}" alt="icon">
      <p>Min: ${minTemp}°C</p>
      <p>Max: ${maxTemp}°C</p>
      <div class="hourly-entry"></div>
    `;
    block.addEventListener("click", () => toggleHourlyDetail(block, i));
    forecast3dayDiv.appendChild(block);
  }
}

function toggleHourlyDetail(block, dayIndex) {
  const hourlyDiv = block.querySelector(".hourly-entry");
  if (hourlyDiv.style.display === "block") {
    hourlyDiv.style.display = "none";
    hourlyDiv.innerHTML = "";
  } else {
    hourlyDiv.innerHTML = "";
    for (let h = 0; h < 24; h++) {
      const time = hourlyData.time[h].split("T")[1];
      const temp = hourlyData.temperature_2m[h];
      const icon = getWeatherIcon(hourlyData.weathercode[h]);
      const entry = document.createElement("div");
      entry.innerHTML = `${time}: ${temp}°C <img class="weather-icon" src="${icon}" alt="icon">`;
      hourlyDiv.appendChild(entry);
    }
    hourlyDiv.style.display = "block";
  }
}

function getWeatherIcon(code) {
  if (code === 0) return "https://img.icons8.com/color/64/000000/sun--v1.png";
  if (code === 1 || code === 2 || code === 3) return "https://img.icons8.com/color/64/000000/partly-cloudy-day--v1.png";
  if (code === 45 || code === 48) return "https://img.icons8.com/color/64/000000/fog-day.png";
  if (code >= 51 && code <= 67) return "https://img.icons8.com/color/64/000000/rain.png";
  if (code >= 71 && code <= 77) return "https://img.icons8.com/color/64/000000/snow.png";
  if (code >= 80 && code <= 82) return "https://img.icons8.com/color/64/000000/rain.png";
  if (code >= 95) return "https://img.icons8.com/color/64/000000/storm.png";
  return "https://img.icons8.com/color/64/000000/sun--v1.png";
}
