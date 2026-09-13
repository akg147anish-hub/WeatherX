const cityInput = document.getElementById("cityInput");

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        getWeather();
    }
});


async function getWeather() {

    const city = cityInput.value.trim();

    const errorMessage =
        document.getElementById("errorMessage");

    const dashboard =
        document.getElementById("weatherDashboard");

    const welcomeScreen =
        document.getElementById("welcomeScreen");


    if (!city) {
        showError("Please enter a city name.");
        return;
    }


    try {

        const response = await fetch(
            `/weather?city=${encodeURIComponent(city)}`
        );

        const data = await response.json();


        if (!response.ok) {
            showError(data.error || "Unable to get weather data.");
            return;
        }


        errorMessage.style.display = "none";

        welcomeScreen.classList.add("hidden");

        dashboard.classList.remove("hidden");


        updateCurrentWeather(data.current);

        updateForecast(data.forecast);

    }

    catch (error) {

        console.error(error);

        showError(
            "Something went wrong. Check your API connection."
        );

    }
}


function updateCurrentWeather(weather) {

    document.getElementById("cityName").textContent =
        weather.city;

    document.getElementById("countryName").textContent =
        weather.country;

    document.getElementById("temperature").textContent =
        weather.temperature;

    document.getElementById("condition").textContent =
        weather.condition;

    document.getElementById("description").textContent =
        weather.description;

    document.getElementById("feelsLike").textContent =
        weather.feels_like;

    document.getElementById("humidity").textContent =
        weather.humidity;

    document.getElementById("wind").textContent =
        weather.wind;

    document.getElementById("visibility").textContent =
        weather.visibility;


    document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${weather.icon}@4x.png`;


    const sunrise =
        new Date(weather.sunrise * 1000);

    const sunset =
        new Date(weather.sunset * 1000);


    document.getElementById("sunrise").textContent =
        formatTime(sunrise);

    document.getElementById("sunset").textContent =
        formatTime(sunset);
}


function updateForecast(forecast) {

    const container =
        document.getElementById("forecastContainer");

    container.innerHTML = "";


    forecast.forEach((day, index) => {

        const date =
            new Date(day.date * 1000);

        const card =
            document.createElement("div");

        card.className = "forecast-card";


        card.innerHTML = `

            <div class="day">
                ${index === 0 ? "TODAY" : getDay(date)}
            </div>

            <img
                src="https://openweathermap.org/img/wn/${day.icon}@2x.png"
                alt="${day.condition}"
            >

            <div class="temp">
                ${day.temperature}°C
            </div>

            <div class="weather">
                ${day.condition}
            </div>

        `;

        container.appendChild(card);

    });
}


function formatTime(date) {

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}


function getDay(date) {

    return date.toLocaleDateString("en-US", {
        weekday: "short"
    });

}


function showError(message) {

    const errorMessage =
        document.getElementById("errorMessage");

    errorMessage.textContent = message;

    errorMessage.style.display = "block";
}