import os
import sys
import json
from dotenv import load_dotenv

# Add backend root to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from tools.weather_tool import get_weather
from tools.traffic_tool import get_traffic
from tools.aqi_tool     import get_aqi
from tools.tide_tool    import get_tides
from tools.event_tool   import get_events
from tools.geocode_tool import geocode_location

load_dotenv()

def test_api(name, func, *args, **kwargs):
    print(f"\n--- Testing {name} ---")
    try:
        res = func(*args, **kwargs)
        # Check if result indicates fallback
        is_live = False
        if isinstance(res, dict):
            is_live = res.get("source") == "live"
        elif isinstance(res, list):
            # for events, we check if it's fallback
            is_live = any(e.get("impact") != "baseline" for e in res if isinstance(e, dict))
            
        status = "SUCCESS (LIVE)" if is_live else "FALLBACK/CACHED"
        print(f"Status: {status}")
        print(f"Result: {json.dumps(res, indent=2, default=str)[:500]}...")
        return {"name": name, "status": status, "success": True}
    except Exception as e:
        print(f"Status: ERROR")
        print(f"Error: {e}")
        return {"name": name, "status": "ERROR", "success": False, "error": str(e)}

if __name__ == "__main__":
    results = []
    
    # 1. Geocoding (Nominatim)
    results.append(test_api("Geocoding (Nominatim)", geocode_location, "Kalyan Station"))
    
    # 2. Weather (OpenWeather)
    results.append(test_api("Weather (OpenWeather)", get_weather, lat=19.2319, lon=73.1311))
    
    # 3. Traffic (Google Maps)
    results.append(test_api("Traffic (Google Maps)", get_traffic, origin="Kalyan Station", destination="Dadar Station"))
    
    # 4. AQI (AirVisual)
    results.append(test_api("AQI (AirVisual)", get_aqi))
    
    # 5. Tides (World Tides / Marea)
    results.append(test_api("Tides (World Tides)", get_tides, location="Juhu Beach"))
    
    # 6. Events (PredictHQ)
    results.append(test_api("Events (PredictHQ)", get_events))
    
    print("\n" + "="*40)
    print("FINAL DIAGNOSTIC SUMMARY")
    print("="*40)
    for r in results:
        sym = "✅" if "LIVE" in r["status"] else "⚠️" if "FALLBACK" in r["status"] else "❌"
        print(f"{sym} {r['name']}: {r['status']}")
    print("="*40)
