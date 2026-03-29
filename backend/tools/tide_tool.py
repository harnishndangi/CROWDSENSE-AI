import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

WORLD_TIDES_API_KEY = os.getenv("WORLD_TIDES_API_KEY")

FALLBACK_TIDES = {
    "tide_level": "Low",
    "height": 1.2,
    "source": "cached"
}

# Coastal coordinates for Mumbai beaches
BEACH_COORDS = {
    "Juhu Beach": {"lat": 19.1026, "lon": 72.8242},
    "Marine Drive": {"lat": 18.9438, "lon": 72.8231},
    "Girgaum Chowpatty": {"lat": 18.9515, "lon": 72.8166},
    "Versova Beach": {"lat": 19.1311, "lon": 72.8136}
}

import time
import math

def _get_dynamic_tides(location):
    h = int(time.time() // 3600)
    base = abs(hash(f"{location}_{h}")) % 100
    hour_of_day = (h + 5) % 24  # IST approx
    
    # Simulate semidiurnal tide
    wave = math.sin(hour_of_day * math.pi / 6.0)
    height = 2.0 + (wave * 2.0) + (base / 100.0)
    
    level = "High" if height > 2.5 else "Low"
    return {
        "tide_level": level,
        "height": round(height, 2),
        "source": "simulated"
    }

def get_tides(location="Juhu Beach"):
    """
    Fetches tidal data for a given beachfront location in Mumbai.
    """
    coords = BEACH_COORDS.get(location)
    if not coords or not WORLD_TIDES_API_KEY or WORLD_TIDES_API_KEY == "your_world_tides_key_here":
        return _get_dynamic_tides(location)

    url = f"https://www.worldtides.info/api/v3?heights&lat={coords['lat']}&lon={coords['lon']}&key={WORLD_TIDES_API_KEY}"

    try:
        response = requests.get(url, timeout=3)
        response.raise_for_status()
        data = response.json()
        
        # Get most recent height
        current_height = data.get("heights", [{}])[0].get("height", 1.2)
        
        # Simple thresholding for Mumbai
        level = "High" if current_height > 2.5 else "Low"
        
        return {
            "tide_level": level,
            "height": current_height,
            "source": "live"
        }
    except Exception as e:
        print(f"Tide API Error: {e}")
        return _get_dynamic_tides(location)

if __name__ == "__main__":
    print(get_tides())
