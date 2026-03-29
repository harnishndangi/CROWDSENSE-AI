import os
import requests
import time
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

# Traffic data cache with timestamp
traffic_cache = {}
CACHE_TTL = 300  # 5 minutes

FALLBACK_TRAFFIC = {
    "traffic_level": 1,
    "congestion_ratio": 1.2,
    "source": "cached"
}

def _get_tomtom_traffic(lat=19.0760, lon=72.8777, location_name="Mumbai"):
    """
    Fetch live traffic data from TomTom API.
    Returns incident count, flow speed, and congestion data.
    """
    if not TOMTOM_API_KEY or TOMTOM_API_KEY == "your_tomtom_key_here":
        return _get_fallback_tomtom_data(location_name)
    
    try:
        # TomTom Flow API - current traffic conditions
        flow_url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json"
        params = {
            "key": TOMTOM_API_KEY,
            "point": f"{lat},{lon}",
            "unit": "KMPH"
        }
        
        response = requests.get(flow_url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            flow = data.get("flowSegmentData", {})
            
            current_speed = flow.get("currentSpeed", 25)
            free_flow_speed = flow.get("freeFlowSpeed", 40)
            
            # Calculate congestion ratio
            if free_flow_speed > 0:
                congestion = free_flow_speed / max(current_speed, 1)
            else:
                congestion = 1.0
            
            # TomTom Incident API
            incident_url = f"https://api.tomtom.com/traffic/services/5/incidentDetails"
            incident_params = {
                "key": TOMTOM_API_KEY,
                "bbox": f"{lat-0.05},{lon-0.05},{lat+0.05},{lon+0.05}",
                "language": "en-GB"
            }
            
            try:
                inc_response = requests.get(incident_url, params=incident_params, timeout=5)
                incidents = []
                if inc_response.status_code == 200:
                    inc_data = inc_response.json()
                    incidents = inc_data.get("incidents", [])
            except:
                incidents = []
            
            return {
                "current_speed_kmph": current_speed,
                "free_flow_speed_kmph": free_flow_speed,
                "congestion_ratio": round(congestion, 2),
                "incidents": len(incidents),
                "source": "TomTom Live",
                "location": location_name
            }
        else:
            return _get_fallback_tomtom_data(location_name)
    except Exception as e:
        print(f"TomTom API Error: {e}")
        return _get_fallback_tomtom_data(location_name)

def _get_fallback_tomtom_data(location_name):
    """Generate realistic TomTom fallback data based on location and time"""
    h = datetime.now().hour
    
    # Peak hour detection
    is_peak = (8 <= h <= 11) or (17 <= h <= 20)
    is_weekend = datetime.now().weekday() >= 5
    
    base_speed = 35 if is_weekend else (25 if is_peak else 30)
    free_flow = 45
    congestion = free_flow / base_speed
    
    # Simulate incidents during peak hours
    incidents = 2 if is_peak and not is_weekend else 0
    
    return {
        "current_speed_kmph": base_speed,
        "free_flow_speed_kmph": free_flow,
        "congestion_ratio": round(congestion, 2),
        "incidents": incidents,
        "source": "TomTom Simulated",
        "location": location_name
    }

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

def get_traffic(origin="Andheri Station", destination="Dadar Station", lat=None, lon=None, location_name=None):
    """
    Fetches comprehensive traffic data from Google Maps + TomTom APIs.
    Combines both sources for accurate crowd prediction context.
    
    Args:
        origin: Origin address for Google Maps
        destination: Destination address for Google Maps
        lat: Latitude for TomTom (if None, extracts from origin)
        lon: Longitude for TomTom (if None, uses default)
        location_name: Name for TomTom data context
    """
    # Get Google Maps traffic data
    google_data = _fetch_traffic(origin, destination, int(time.time() // 900))
    
    # Get TomTom traffic data (with coordinates if available)
    tomtom_data = _get_tomtom_traffic(
        lat=lat or 19.0760,
        lon=lon or 72.8777,
        location_name=location_name or origin
    )
    
    # Combine both sources
    combined = {
        "google_maps": google_data,
        "tomtom": tomtom_data,
        "combined_congestion": round(
            (google_data.get("congestion_ratio", 1.2) + 
             tomtom_data.get("congestion_ratio", 1.2)) / 2, 2
        ),
        "traffic_level": max(
            google_data.get("traffic_level", 1),
            2 if tomtom_data.get("congestion_ratio", 1.0) > 1.5 else 1
        ),
        "incidents_nearby": tomtom_data.get("incidents", 0),
        "current_speed_kmph": tomtom_data.get("current_speed_kmph", 30),
        "sources": [google_data.get("source", "simulated"), tomtom_data.get("source", "simulated")]
    }
    
    return combined

def get_comprehensive_traffic_for_location(location_name, lat=None, lon=None):
    """
    Get comprehensive traffic data for a single location (not route).
    Uses TomTom for live conditions at that point.
    """
    cache_key = f"{location_name}_{int(time.time() // CACHE_TTL)}"
    
    if cache_key in traffic_cache:
        return traffic_cache[cache_key]
    
    # Get TomTom data at location
    tomtom_data = _get_tomtom_traffic(lat or 19.0760, lon or 72.8777, location_name)
    
    # Get route-based data (to nearby major station)
    google_data = _fetch_traffic(
        f"{location_name}, Mumbai", 
        "Dadar Station, Mumbai",
        int(time.time() // 900)
    )
    
    result = {
        "location": location_name,
        "lat": lat or 19.0760,
        "lon": lon or 72.8777,
        "congestion_ratio": round(tomtom_data.get("congestion_ratio", 1.2), 2),
        "traffic_level": tomtom_data.get("congestion_ratio", 1.2) > 1.5 and 2 or 
                        (tomtom_data.get("congestion_ratio", 1.2) > 1.2 and 1 or 0),
        "incidents_nearby": tomtom_data.get("incidents", 0),
        "current_speed_kmph": tomtom_data.get("current_speed_kmph", 30),
        "route_congestion": google_data.get("congestion_ratio", 1.2),
        "sources": [tomtom_data.get("source", "simulated"), google_data.get("source", "simulated")],
        "timestamp": datetime.now().isoformat()
    }
    
    # Cache result
    traffic_cache[cache_key] = result
    
    return result

if __name__ == "__main__":
    print(get_traffic())
