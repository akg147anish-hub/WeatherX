from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")

CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/weather")
def weather():
    city = request.args.get("city")

    if not city:
        return jsonify({
            "error": "Please enter a city name."
        }), 400

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric"
    }

    try:
        current_response = requests.get(
            CURRENT_WEATHER_URL,
            params=params
        )

        forecast_response = requests.get(
            FORECAST_URL,
            params=params
        )

        if current_response.status_code == 401:
            return jsonify({
                "error": "Invalid or inactive OpenWeather API key."
            }), 401

        if current_response.status_code == 404:
            return jsonify({
                "error": "City not found. Please check the city name."
            }), 404

        if current_response.status_code != 200:
            return jsonify({
                "error": f"OpenWeather API error: {current_response.status_code}"
            }), current_response.status_code

        current_data = current_response.json()
        forecast_data = forecast_response.json()

        current = {
            "city": current_data["name"],
            "country": current_data["sys"]["country"],
            "temperature": round(current_data["main"]["temp"]),
            "feels_like": round(current_data["main"]["feels_like"]),
            "humidity": current_data["main"]["humidity"],
            "wind": round(current_data["wind"]["speed"] * 3.6, 1),
            "visibility": round(
                current_data.get("visibility", 0) / 1000, 1
            ),
            "condition": current_data["weather"][0]["main"],
            "description": current_data["weather"][0]["description"],
            "icon": current_data["weather"][0]["icon"],
            "sunrise": current_data["sys"]["sunrise"],
            "sunset": current_data["sys"]["sunset"]
        }

        forecast = []

        for item in forecast_data["list"][::8][:5]:
            forecast.append({
                "date": item["dt"],
                "temperature": round(item["main"]["temp"]),
                "condition": item["weather"][0]["main"],
                "icon": item["weather"][0]["icon"]
            })

        return jsonify({
            "current": current,
            "forecast": forecast
        })

    except requests.exceptions.RequestException:
        return jsonify({
            "error": "Unable to connect to weather service."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)