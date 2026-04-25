import requests

class WeatherService:
    @staticmethod
    def get_weather_forecast(city="Bogota"):
        """
        Consulta el clima actual (Simulado o real con API Key).
        Por ahora devolveremos un mock profesional que puedes conectar
        a OpenWeatherMap facilmente.
        """
        # Aqui iría tu API_KEY de OpenWeather
        # url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid=TU_KEY"
        
        # Simulacion de respuesta profesional
        return {
            "city": city,
            "temp": 22.5,
            "condition": "Cloudy",
            "rain_probability": 0.65, # 65% de probabilidad de lluvia
            "is_raining": False
        }

    @staticmethod
    def should_skip_irrigation(city="Bogota"):
        """
        Logica de ahorro de agua: Si va a llover mucho, saltamos el riego.
        """
        forecast = WeatherService.get_weather_forecast(city)
        if forecast["rain_probability"] > 0.80:
            print(f"[CLIMA] Probabilidad de lluvia alta ({forecast['rain_probability']}). Ahorrando agua.")
            return True
        return False
