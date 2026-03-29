import sys, os
sys.path.insert(0, 'c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend')

from tools.ssl_patch import patch_ssl
patch_ssl()

from tools.geocode_tool import geocode_location
from tools.weather_tool import get_weather
from tools.traffic_tool import get_traffic
from tools.tomtom_tool import get_tomtom_flow, get_tomtom_incidents
from tools.aqi_tool import get_aqi
from tools.event_tool import get_events
from tools.tide_tool import get_tides
from tools.x_tool import get_x_signals

def test_apis():
    results = []
    
    # 1. Geocoding
    try:
        geo = geocode_location("Kalyan Station")
        results.append(f"1. Geocoding [OK] Lat: {geo.get('lat')}, Lon: {geo.get('lon')}")
    except Exception as e:
        results.append(f"1. Geocoding [FAIL] {e}")

    lat, lon = geo.get('lat', 19.2359), geo.get('lon', 73.1299)
    loc_str = "Kalyan Station"

    # 2. Weather
    try:
        weather = get_weather(lat=lat, lon=lon)
        results.append(f"2. Weather [OK] Temp: {weather.get('temp')}C, Condition: {weather.get('condition')}")
    except Exception as e:
        results.append(f"2. Weather [FAIL] {e}")

    # 3. Traffic
    try:
        traffic = get_traffic(origin=loc_str, destination="Mumbai Central")
        results.append(f"3. Traffic [OK] Congestion Ratio: {traffic.get('congestion_ratio')}")
    except Exception as e:
        results.append(f"3. Traffic [FAIL] {e}")

    # 4. TomTom Flow
    try:
        flow = get_tomtom_flow(lat=lat, lon=lon)
        results.append(f"4. TomTom Flow [OK] Speed: {flow.get('current_speed')} km/h, Ratio: {flow.get('congestion_ratio')}")
    except Exception as e:
        results.append(f"4. TomTom Flow [FAIL] {e}")

    # 5. TomTom Incidents
    try:
        incs = get_tomtom_incidents(lat=lat, lon=lon)
        results.append(f"5. TomTom Incidents [OK] Count: {incs.get('count')}")
    except Exception as e:
        results.append(f"5. TomTom Incidents [FAIL] {e}")

    # 6. AQI
    try:
        aqi = get_aqi()
        results.append(f"6. AQI [OK] AQI: {aqi.get('aqi')}, Label: {aqi.get('label')}")
    except Exception as e:
        results.append(f"6. AQI [FAIL] {e}")

    # 7. Events
    try:
        events = get_events()
        results.append(f"7. Events [OK] Found {len(events)} upcoming events.")
    except Exception as e:
        results.append(f"7. Events [FAIL] {e}")

    # 8. Tides
    try:
        tides = get_tides("Marine Drive")
        results.append(f"8. Tides [OK] Tide Level: {tides.get('tide_level')}, Height: {tides.get('height')}")
    except Exception as e:
        results.append(f"8. Tides [FAIL] {e}")

    # 9. X (Twitter)
    try:
        x_sig = get_x_signals("Mumbai")
        results.append(f"9. X Signals [OK] Sentiment: {x_sig.get('sentiment')}, Reports: {x_sig.get('recent_reports')}")
    except Exception as e:
        results.append(f"9. X Signals [FAIL] {e}")

    with open('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend/tests/api_results_clean.txt', 'w') as f:
        f.write("\n".join(results))

if __name__ == "__main__":
    test_apis()
