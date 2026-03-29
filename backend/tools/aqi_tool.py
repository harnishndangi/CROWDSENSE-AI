import os
import requests
from dotenv import load_dotenv

load_dotenv()

AIRVISUAL_API_KEY = os.getenv("AIRVISUAL_API_KEY")

FALLBACK_AQI = {
    "aqi": 85,
    "label": "Moderate",
    "source": "cached"
}

import time

def _get_dynamic_aqi(city):
    h = int(time.time() // 3600)
    base = abs(hash(f"{city}_{h}")) % 100
    
    aqi_val = 60 + int(base * 1.4) # Range 60 to 200
    
    label = "Good"
    if aqi_val > 150: label = "Unhealthy"
    elif aqi_val > 100: label = "Poor"
    elif aqi_val > 50: label = "Moderate"
    
    return {
        "aqi": aqi_val,
        "label": label,
        "source": "simulated"
    }

def get_aqi(city="Mumbai", state="Maharashtra", country="India"):
    """
    Fetches real-time Air Quality Index (AQI) for Mumbai.
    """
    if not AIRVISUAL_API_KEY or AIRVISUAL_API_KEY == "your_airvisual_key_here":
        return _get_dynamic_aqi(city)

    url = f"http://api.airvisual.com/v2/city?city={city}&state={state}&country={country}&key={AIRVISUAL_API_KEY}"

    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()
        data = response.json()
        
        aqi_val = data["data"]["current"]["pollution"]["aqius"]
        
        label = "Good"
        if aqi_val > 150: label = "Unhealthy"
        elif aqi_val > 100: label = "Poor"
        elif aqi_val > 50: label = "Moderate"
        
        return {
            "aqi": aqi_val,
            "label": label,
            "source": "live"
        }
    except Exception as e:
        print(f"AQI API Error: {e}")
        return _get_dynamic_aqi(city)

if __name__ == "__main__":
    print(get_aqi())
