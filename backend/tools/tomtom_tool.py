import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOMTOM_API_KEY = os.getenv("TOMTOM_API_KEY")

def get_tomtom_incidents(lat=19.0760, lon=72.8777, radius=5000):
    """
    Fetches traffic incidents (accidents, jams, roadworks) around a location using TomTom API.
    """
    if not TOMTOM_API_KEY or TOMTOM_API_KEY == "your_tomtom_key_here":
        return {"incidents": [], "source": "cached"}

    # TomTom Incident Details URL
    # Format: https://api.tomtom.com/traffic/services/4/incidentDetails/s3/{bbox}/{zoom}/{offset}/{key}
    # However, a simpler way for general area is the 'incidentDetails' with a bounding box.
    # Let's use a small bbox around the lat/lon.
    delta = 0.05
    bbox = f"{lon-delta},{lat-delta},{lon+delta},{lat+delta}"
    
    url = f"https://api.tomtom.com/traffic/services/4/incidentDetails/s3/{bbox}/10/0/json?key={TOMTOM_API_KEY}"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        incidents = []
        for inc in data.get("tm", {}).get("poi", []):
            incidents.append({
                "type": inc.get("ic"),  # Incident code
                "description": inc.get("d"),  # Description (e.g. "accident")
                "severity": inc.get("ty"),   # Severity (0-4)
                "road": inc.get("f", "Unknown Road"),
                "delay": inc.get("dl", 0)     # Delay in seconds
            })
            
        return {"incidents": incidents, "count": len(incidents), "source": "live"}
    except Exception as e:
        print(f"TomTom API Error: {e}")
        return {"incidents": [], "source": "error"}

def get_tomtom_flow(lat=19.0760, lon=72.8777):
    """
    Fetches real-time traffic flow (speed vs free-flow speed).
    """
    if not TOMTOM_API_KEY:
        return {"flow": "normal", "source": "cached"}
        
    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point={lat},{lon}&key={TOMTOM_API_KEY}"
    
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        flow_data = data.get("flowSegmentData", {})
        curr_speed = flow_data.get("currentSpeed", 40)
        free_speed = flow_data.get("freeFlowSpeed", 40)
        confidence = flow_data.get("confidence", 0.5)
        
        ratio = curr_speed / free_speed if free_speed > 0 else 1.0
        
        return {
            "current_speed": curr_speed,
            "free_flow_speed": free_speed,
            "congestion_ratio": round(1.0/ratio, 2) if ratio > 0 else 1.0,
            "confidence": confidence,
            "source": "live"
        }
    except Exception as e:
        print(f"TomTom Flow Error: {e}")
        return {"flow": "normal", "source": "error"}

if __name__ == "__main__":
    print("\n--- Testing TomTom Incidents ---")
    print(get_tomtom_incidents())
    print("\n--- Testing TomTom Flow ---")
    print(get_tomtom_flow())
