(document).ready(function () {
    var searchHistoryContainer = $("#past-searches");
    var searchForm = $("#search-form");
    var currentWeatherContainer = $("#current-weather");
    var fiveDayForecastContainer = $("#five-day-forecast");
    var searchValueInput = $("#search-value");
    var apiKey = "693f93882694cc1b329e03ea3d8adc44";
    var baseUrl = "https://api.openweathermap.org/data/2.5/weather?";
    var baseUrl2 = "https://api.openweathermap.org/data/2.5/forecast?";
    var iconBaseUrl = "https://openweathermap.org/img/w/";
    var uvIndexBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?";
    var searchHistory = [];
    //  WHEN I search for a city
    searchForm.submit(function (event) {
      event.preventDefault();
      console.log(event);
      // $(this) = THIS FORM THAT JUST SUBMITTED
      var formValues = $(this).serializeArray();
      var city = formValues[0].value;
      // create element with jQuery selector
      var searchTermDiv = $(
        '<button type="button" class="btn past-search-term">'
      );
      searchTermDiv.click(function (event) {
        event.preventDefault();
        var value = $(this).text();
        searchForCurrentCityWeather(value);
        searchForFiveDayForecastWeather(value);
      });
  
      searchHistory.push(city);
      localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
      searchTermDiv.text(city);
      searchHistoryContainer.append(searchTermDiv);
      console.log(formValues, city);
      // Real data from form
      searchForCurrentCityWeather(city);
      searchForFiveDayForecastWeather(city);
      searchValueInput.val("");
    });
    function searchForCurrentCityWeather(city) {
      currentWeatherContainer.html("");
      var fullUrl = baseUrl + "q=" + city + "&appid=" + apiKey;
  
      console.log(fullUrl);
      fetch(fullUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);
          var cityName = data.name;
          var temp = data.main.temp;
          var humidity = data.main.humidity;
          var weather = data.weather;
          var iconUrl = iconBaseUrl + weather[0].icon + ".png";
          var wind = data.wind;
          console.log(temp, humidity, weather, wind);
          var cityNameDiv = $('<div class="city-name">');
          var tempDiv = $('<div class="temp-name">');
          var humidityDiv = $('<div class="humidity-name">');
          var weatherImg = $('<img class="icon-name"/>');
          var windDiv = $('<div class="wind-name">');
          cityNameDiv.text(cityName);
          weatherImg.attr("src", iconUrl);
          tempDiv.text("Temp: " + temp);
          humidityDiv.text("Humidity: " + humidity + "%");
          windDiv.text("Wind Speed: " + wind.speed + "mph");
  
          currentWeatherContainer.append(cityNameDiv);
          currentWeatherContainer.append(weatherImg);
          currentWeatherContainer.append(tempDiv);
          currentWeatherContainer.append(humidityDiv);
          currentWeatherContainer.append(windDiv);
        });
    }
    function searchForFiveDayForecastWeather(city) {
      fiveDayForecastContainer.html("");
      var forecastUrl = baseUrl2 + "q=" + city + "&appid=" + apiKey;
      fetch(forecastUrl)
        .then(function (responseFromOpenWeatherMapUnprocessed) {
          return responseFromOpenWeatherMapUnprocessed.json();
        })
        .then(function (data) {
          console.log("Five Day Forecast", data);
          var coords = data.city.coord;
          getUVIndex(coords.lat, coords.lon);
          // empty array to collect five days of data
  
          for (var i = 0; i < data.list.length; i++) {
            var isThreeOClock = data.list[i].dt_txt.search("15:00:00");
            if (isThreeOClock > -1) {
              var forecast = data.list[i];
              var temp = forecast.main.temp;
              var humidity = forecast.main.humidity;
              var weather = forecast.weather;
              var iconUrl = iconBaseUrl + weather[0].icon + ".png";
              var wind = forecast.wind;
              var day = moment(forecast.dt_txt).format("ddd, Do");
              console.log(forecast, temp, humidity, weather, wind, day);
              var rowDiv = $('<div class="col-2">');
              var dayDiv = $('<div class="day-name">');
              var tempDiv = $('<div class="temp-name">');
              var humidityDiv = $('<div class="humidity-name">');
              var weatherImg = $('<img class="icon-name" />');
              var windDiv = $('<div class="wind-name">');
              weatherImg.attr("src", iconUrl);
              dayDiv.text(day);
              tempDiv.text("Temp: " + temp);
              humidityDiv.text("Humidity: " + humidity + "%");
              windDiv.text("Wind Speed: " + wind.speed + "mph");
              // combine all values into one container
              rowDiv.append(dayDiv);
              rowDiv.append(weatherImg);
              rowDiv.append(tempDiv);
              rowDiv.append(humidityDiv);
              rowDiv.append(windDiv);
              fiveDayForecastContainer.append(rowDiv);
            }
          }
        });
  
      //WHEN I view future weather conditions for that city
      //THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
    }
  
    function getUVIndex(lat, lon) {
      // lat={lat}&lon={lon}&exclude={part}&appid={API key}
      var finalUrl =
        uvIndexBaseUrl +
        "lat=" +
        lat +
        "&lon=" +
        lon +
        "&exclude=hourly,daily&appid=" +
        apiKey;
      fetch(finalUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          var uvIndex = data.current.uvi;
          var uvIndexDiv = $("<div class='uv-index-div'>");
          var uvIndexSpan = $("<span class='uv-index-number'>");
          uvIndexSpan.text(uvIndex);
          uvIndexDiv.text("UV Index: ");
          uvIndexDiv.append(uvIndexSpan);
          currentWeatherContainer.append(uvIndexDiv);
        });
    }
  
    function retrieveSearchHistory() {
      if (localStorage.getItem("searchHistory")) {
        searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
        for (var i = 0; i < searchHistory.length; i++) {
          var searchTermDiv = $(
            '<button type="button" class="btn past-search-term">'
          );
          searchTermDiv.click(function (event) {
            event.preventDefault();
  
            var value = $(this).text();
            console.log(value);
  
            searchForCurrentCityWeather(value);
            searchForFiveDayForecastWeather(value);
          });
  
          searchTermDiv.text(searchHistory[i]);
          searchHistoryContainer.append(searchTermDiv);
        }
      }
    }
  
    retrieveSearchHistory();
  });