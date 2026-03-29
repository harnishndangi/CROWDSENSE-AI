"""
Geocoding Tool — resolves ANY location name to lat/lon + area classification.
Uses OpenStreetMap Nominatim (no API key required).
Also classifies the place type (railway, beach, market, office, religious, residential, etc.)
so the ML feature vector can be built for completely unknown locations.
"""
import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "CrowdSense-Mumbai/1.0 (crowdsense-mumbai.app)"}

# OSM category → our internal area_type mapping
OSM_TO_AREA_TYPE = {
    "railway":     "railway",
    "station":     "railway",
    "train":       "railway",
    "metro":       "railway",
    "bus":         "railway",
    "transport":   "railway",
    "beach":       "beach",
    "waterfront":  "beach",
    "coast":       "beach",
    "market":      "market",
    "mall":        "market",
    "shop":        "market",
    "retail":      "market",
    "bazar":       "market",
    "temple":      "religious",
    "church":      "religious",
    "mosque":      "religious",
    "dargah":      "religious",
    "mandir":      "religious",
    "office":      "office",
    "business":    "office",
    "commercial":  "office",
    "bank":        "office",
    "hospital":    "office",
    "residential": "residential",
}

def _classify_from_name(name: str, osm_type: str, osm_class: str) -> str:
    """Guess area_type from place name and OSM metadata."""
    combined = f"{name} {osm_type} {osm_class}".lower()
    for keyword, area in OSM_TO_AREA_TYPE.items():
        if keyword in combined:
            return area
    return "residential"  # safe default

def geocode_location(location_name: str, city_hint: str = "Mumbai") -> dict:
    """
    Resolves a location name string to:
      {lat, lon, display_name, area_type, is_coastal, zone_hint}
    Falls back to Mumbai centre if lookup fails.
    """
    query = f"{location_name}, {city_hint}"
    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={"q": query, "format": "json", "limit": 1, "countrycodes": "in"},
            headers=HEADERS,
            timeout=4,
        )
        resp.raise_for_status()
        results = resp.json()

        if not results:
            # Try without city hint
            resp = requests.get(
                NOMINATIM_URL,
                params={"q": location_name, "format": "json", "limit": 1, "countrycodes": "in"},
                headers=HEADERS,
                timeout=4,
            )
            results = resp.json()

        if results:
            r = results[0]
            lat = float(r["lat"])
            lon = float(r["lon"])
            display = r.get("display_name", location_name)
            osm_type = r.get("type", "")
            osm_class = r.get("class", "")
            area_type = _classify_from_name(location_name, osm_type, osm_class)

            # Coastal heuristic: Mumbai coastline is roughly lon < 72.86
            is_coastal = lon < 72.86 and lat < 19.15

            return {
                "lat": lat,
                "lon": lon,
                "display_name": display,
                "area_type": area_type,
                "is_coastal": is_coastal,
                "resolved": True,
            }

    except Exception as e:
        print(f"[Geocode] Error for '{location_name}': {e}")

    # Hard fallback — Mumbai centre
    return {
        "lat": 19.0760,
        "lon": 72.8777,
        "display_name": location_name,
        "area_type": "residential",
        "is_coastal": False,
        "resolved": False,
    }

if __name__ == "__main__":
    for place in ["Kalyan Station", "Dadar Station", "Juhu Beach", "BKC", "Siddhivinayak Temple", "Gateway of India"]:
        info = geocode_location(place)
        print(f"{place}: lat={info['lat']:.4f}, lon={info['lon']:.4f}, area={info['area_type']}, coastal={info['is_coastal']}")
