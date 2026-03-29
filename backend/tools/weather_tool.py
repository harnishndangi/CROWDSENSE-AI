import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

FALLBACK_WEATHER = {
    "condition": "Clear",
    "temp": 28.0,
    "humidity": 60,
    "wind": 5.0,
    "rain": 0,
    "source": "cached"
}

import time

def _get_dynamic_fallback(lat, lon):
    # Create deterministic but dynamic fallback based on location and hour
    h = int(time.time() // 3600)
    base = abs(hash(f"{lat}_{lon}_{h}")) % 100
    
    # Temperature ranges 24 to 34
    temp = 24.0 + (base / 10.0)
    
    # Humidity 55 to 85
    hum = 55 + (base % 30)
    
    conditions = ["Clear", "Haze", "Partly Cloudy", "Scattered Clouds", "Overcast", "Light Rain"]
    cond = conditions[base % len(conditions)]
    
    return {
        "condition": cond,
        "temp": round(temp, 1),
        "humidity": hum,
        "wind": round(4.0 + (base % 12), 1),
        "rain": 0 if "Rain" not in cond else 1.2,
        "source": "simulated"
    }

from functools import lru_cache

@lru_cache(maxsize=32)
def _fetch_weather(lat, lon, ttl_hash):
    if not OPENWEATHER_API_KEY or OPENWEATHER_API_KEY == "your_openweather_key_here":
        return _get_dynamic_fallback(lat, lon)

    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
    
    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()
        data = response.json()
        
        return {
            "condition": data["weather"][0]["main"],
            "temp": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "wind": data.get("wind", {}).get("speed", 5.0),
            "rain": data.get("rain", {}).get("1h", 0),
            "source": "live"
        }
    except Exception as e:
        print(f"Weather API Error: {e}")
        return _get_dynamic_fallback(lat, lon)

def get_weather(lat=19.0760, lon=72.8777):
    """
    Fetches live weather from OpenWeather API for given lat/lon.
    Returns a dict with condition, temp, rain, and source.
    Uses lru_cache with 15 min TTL.
    """
    return _fetch_weather(round(lat, 2), round(lon, 2), int(time.time() // 900))

if __name__ == "__main__":
    # Test call
    print(get_weather(lat=19.2359, lon=73.1299))
