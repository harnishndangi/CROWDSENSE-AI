import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

FALLBACK_TRAFFIC = {
    "traffic_level": 1,  # 0=Low, 1=Medium, 2=High
    "congestion_ratio": 1.2,
    "source": "cached"
}

import time

def _get_dynamic_traffic(origin, destination):
    h = int(time.time() // 3600)
    base = abs(hash(f"{origin}_{destination}_{h}")) % 100
    
    # Realistically simulate higher traffic during peak hours
    hour_of_day = (h + 5) % 24  # UTC to IST rough approx
    is_peak = (8 <= hour_of_day <= 10) or (17 <= hour_of_day <= 20)
    
    ratio = 1.0 + (base / 100.0)
    if is_peak:
        ratio += 0.4
    
    if ratio > 1.5: level = 2
    elif ratio > 1.2: level = 1
    else: level = 0
    
    return {
        "traffic_level": level,
        "congestion_ratio": round(ratio, 2),
        "source": "simulated"
    }

from functools import lru_cache

@lru_cache(maxsize=128)
def _fetch_traffic(origin, destination, ttl_hash):
    if not GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY == "your_google_maps_key_here":
        return _get_dynamic_traffic(origin, destination)

    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.staticDuration"
    }
    
    body = {
        "origin": {"address": origin},
        "destination": {"address": destination},
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE"
    }

    try:
        response = requests.post(url, json=body, headers=headers, timeout=3)
        response.raise_for_status()
        data = response.json()
        
        route = data.get("routes", [{}])[0]
        duration = int(route.get("duration", "0s").replace("s", ""))
        static_duration = int(route.get("staticDuration", "0s").replace("s", ""))
        
        if static_duration == 0:
            return _get_dynamic_traffic(origin, destination)
            
        ratio = duration / static_duration
        
        level = 0
        if ratio > 1.5: level = 2
        elif ratio > 1.2: level = 1
        
        return {
            "traffic_level": level,
            "congestion_ratio": round(ratio, 2),
            "source": "live"
        }
    except Exception as e:
        print(f"Traffic API Error: {e}")
        return _get_dynamic_traffic(origin, destination)

def get_traffic(origin="Andheri Station", destination="Dadar Station"):
    """
    Fetches traffic data from Google Maps Routes API.
    Calculates congestion ratio and maps it to a level.
    Uses lru_cache with 15 min TTL.
    """
    return _fetch_traffic(origin, destination, int(time.time() // 900))

if __name__ == "__main__":
    print(get_traffic())
