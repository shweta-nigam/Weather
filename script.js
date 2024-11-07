const apiKey = "6c032b8f0069f8983b77279fb7acdb01";
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];

$(document).ready(() => {
  loadRecentSearches();
  $('#city-input').autocomplete({ source: recentSearches });

  $('#search-button').click(searchWeather);
  $('#city-input').on('keypress', (e) => { if (e.key === 'Enter') searchWeather(); });

  setInterval(() => {
    const city = $('#city-name').text();
    if (city) fetchWeather(city);
  }, 300000); // 5 minutes
});

// Search Weather and Add to Recent Searches
function searchWeather() {
  const city = $('#city-input').val();
  if (!city) return;
  
  fetchWeather(city);
  addRecentSearch(city);
  $('#city-input').val('');
}

// Fetch Weather Data from API
function fetchWeather(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => displayWeather(data))
    .catch(error => console.error("Error fetching data:", error));
}

// Display Weather Data in the UI
function displayWeather(data) {
  $('#city-name').text(data.name);
  $('#temperature').text(`${data.main.temp}°C`);
  $('#description').text(data.weather[0].description);
  
  const iconCode = data.weather[0].icon;
  const weatherMain = data.weather[0].main;

  setWeatherIcon(iconCode);
  applyBackground(weatherMain, iconCode);
}

// Set Weather Icon Based on Icon Code
function setWeatherIcon(iconCode) {
  const iconElement = $('#weather-icon');
  const iconMap = {
    "01d": "fas fa-sun", "01n": "fas fa-moon",
    "02d": "fas fa-cloud-sun", "02n": "fas fa-cloud-moon",
    "03d": "fas fa-cloud", "03n": "fas fa-cloud",
    "04d": "fas fa-cloud-meatball", "04n": "fas fa-cloud-meatball",
    "09d": "fas fa-cloud-showers-heavy", "09n": "fas fa-cloud-showers-heavy",
    "10d": "fas fa-cloud-sun-rain", "10n": "fas fa-cloud-moon-rain",
    "11d": "fas fa-bolt", "11n": "fas fa-bolt",
    "13d": "fas fa-snowflake", "13n": "fas fa-snowflake",
    "50d": "fas fa-smog", "50n": "fas fa-smog"
  };
  iconElement.attr("class", iconMap[iconCode] || "fas fa-cloud");
}

// Apply Background Based on Weather Condition and Icon
function applyBackground(weatherMain, iconCode) {
  const weatherApp = $('.weather-app');
  weatherApp.removeClass();

  if (iconCode.endsWith("d")) { // Daytime
    if (weatherMain === "Clear") weatherApp.addClass("weather-app clear-day");
    else if (weatherMain === "Clouds") weatherApp.addClass("weather-app cloudy");
    else if (weatherMain === "Rain" || weatherMain === "Drizzle") weatherApp.addClass("weather-app rainy");
    else if (weatherMain === "Snow") weatherApp.addClass("weather-app snowy");
    else if (weatherMain === "Mist" || weatherMain === "Fog") weatherApp.addClass("weather-app misty");
  } else { // Nighttime
    if (weatherMain === "Clear") weatherApp.addClass("weather-app clear-night");
    else if (weatherMain === "Clouds") weatherApp.addClass("weather-app cloudy");
    else if (weatherMain === "Rain" || weatherMain === "Drizzle") weatherApp.addClass("weather-app rainy");
    else if (weatherMain === "Snow") weatherApp.addClass("weather-app snowy");
    else if (weatherMain === "Mist" || weatherMain === "Fog") weatherApp.addClass("weather-app misty");
  }
}

function addRecentSearch(city) {
  recentSearches = recentSearches.filter(item => item !== city);
  recentSearches.unshift(city);
  if (recentSearches.length > 3) recentSearches.pop();
  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  loadRecentSearches();
}

// Load Recent Searches from Local Storage to UI
function loadRecentSearches() {
  $('#recent-searches-list').empty();
  recentSearches.forEach(city => {
    $('#recent-searches-list').append(`<li>${city}</li>`);
  });
  $('#city-input').autocomplete({ source: recentSearches });
}

// auto suggest 
$(document).ready(() => {
    $('#city-input').autocomplete({
      source: function(request, response) {
        $.ajax({
          url: "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
          method: "GET",
          data: { namePrefix: request.term, limit: 5 },
          headers: {
            "X-RapidAPI-Key": "a662106c4fmsh8e85a3a32fdc205p13f52fjsncbb740ac0c61", 
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
          },
          success: function(data) {
            const cityNames = data.data.map(city => `${city.name}, ${city.countryCode}`);
            response(cityNames);
          },
          error: function() {
            console.error("Error fetching city data");
            response([]);
          }
        });
      },
      minLength: 2, 
      select: function(event, ui) {
        $('#city-input').val(ui.item.value);
        searchWeather(); 
        return false;
      }
    });
  });
  
