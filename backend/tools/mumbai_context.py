"""
Mumbai Context Registry — Full Coverage
Maps ALL location types to coordinates, crowd signals, and sensitivity flags.
Covers: Local trains (CR/WR), Metro, BEST buses, Auto/Cab zones,
        Railway stations, Bus stops, Malls, Markets, Beaches, Religious places
"""

MUMBAI_LOCATIONS = {

    # ════════════════════════════════════════
    # 🚉 RAILWAY STATIONS — Western Line (WR)
    # ════════════════════════════════════════
    "Borivali Station":         {"type": "railway", "lat": 19.2307, "lon": 72.8567, "line": "WR", "tide_sensitive": False, "event_prone": True},
    "Kandivali Station":        {"type": "railway", "lat": 19.2050, "lon": 72.8520, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Malad Station":            {"type": "railway", "lat": 19.1862, "lon": 72.8490, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Goregaon Station":         {"type": "railway", "lat": 19.1663, "lon": 72.8496, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Jogeshwari Station":       {"type": "railway", "lat": 19.1385, "lon": 72.8490, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Andheri Station":          {"type": "railway", "lat": 19.1197, "lon": 72.8464, "line": "WR", "tide_sensitive": False, "event_prone": True},
    "Vile Parle Station":       {"type": "railway", "lat": 19.0993, "lon": 72.8454, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Santacruz Station":        {"type": "railway", "lat": 19.0826, "lon": 72.8408, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Khar Road Station":        {"type": "railway", "lat": 19.0697, "lon": 72.8377, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Bandra Station":           {"type": "railway", "lat": 19.0544, "lon": 72.8392, "line": "WR", "tide_sensitive": False, "event_prone": True},
    "Mahim Station":            {"type": "railway", "lat": 19.0380, "lon": 72.8408, "line": "WR", "tide_sensitive": True,  "event_prone": False},
    "Matunga Station":          {"type": "railway", "lat": 19.0268, "lon": 72.8450, "line": "WR", "tide_sensitive": False, "event_prone": False},
    "Dadar Station":            {"type": "railway", "lat": 19.0178, "lon": 72.8478, "line": "WR", "tide_sensitive": False, "event_prone": True},

    # ════════════════════════════════════════
    # 🚉 RAILWAY STATIONS — Beyond Mumbai (Thane District)
    # ════════════════════════════════════════
    "Kalyan Station":           {"type": "railway", "lat": 19.2359, "lon": 73.1299, "line": "CR", "tide_sensitive": False, "event_prone": False},
    "Dombivali Station":        {"type": "railway", "lat": 19.2184, "lon": 73.0843, "line": "CR", "tide_sensitive": False, "event_prone": False},
    "Ulhasnagar Station":         {"type": "railway", "lat": 19.2215, "lon": 73.1636, "line": "CR", "tide_sensitive": False, "event_prone": False},
    "Ambernath Station":          {"type": "railway", "lat": 19.2083, "lon": 73.1936, "line": "CR", "tide_sensitive": False, "event_prone": False},
    "Badlapur Station":           {"type": "railway", "lat": 19.1668, "lon": 73.2362, "line": "CR", "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🚉 RAILWAY STATIONS — Central Line (CR)
    # ════════════════════════════════════════
    "CST / CSMT":               {"type": "railway", "lat": 18.9400, "lon": 72.8354, "line": "CR", "tide_sensitive": False, "event_prone": True},
    "Kurla Station":            {"type": "railway", "lat": 19.0654, "lon": 72.8793, "line": "CR", "tide_sensitive": False, "event_prone": True},
    "Ghatkopar Station":        {"type": "railway", "lat": 19.0860, "lon": 72.9081, "line": "CR", "tide_sensitive": False, "event_prone": False},
    "Mulund Station":           {"type": "railway", "lat": 19.1718, "lon": 72.9579, "line": "CR", "tide_sensitive": False, "event_prone": False},
    "Thane Station":            {"type": "transit_hub", "lat": 19.1880, "lon": 72.9688, "line": "CR", "tide_sensitive": False, "event_prone": True},
    "Kopar Khairane Station":   {"type": "railway", "lat": 19.0993, "lon": 73.0157, "line": "CR", "tide_sensitive": False, "event_prone": False},
    "Panvel Station":           {"type": "transit_hub", "lat": 18.9937, "lon": 73.1108, "line": "CR", "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🚇 METRO STATIONS
    # ════════════════════════════════════════
    "Versova Metro":            {"type": "metro", "lat": 19.1326, "lon": 72.8194, "line": "Metro-1", "tide_sensitive": False, "event_prone": False},
    "DN Nagar Metro":           {"type": "metro", "lat": 19.1235, "lon": 72.8298, "line": "Metro-1", "tide_sensitive": False, "event_prone": False},
    "Andheri Metro":            {"type": "metro", "lat": 19.1172, "lon": 72.8490, "line": "Metro-1", "tide_sensitive": False, "event_prone": True},
    "Chakala Metro":            {"type": "metro", "lat": 19.1085, "lon": 72.8670, "line": "Metro-1", "tide_sensitive": False, "event_prone": False},
    "Ghatkopar Metro":          {"type": "metro", "lat": 19.0855, "lon": 72.9082, "line": "Metro-1", "tide_sensitive": False, "event_prone": False},
    "BKC Metro":                {"type": "metro", "lat": 19.0617, "lon": 72.8711, "line": "Metro-2A", "tide_sensitive": False, "event_prone": False},
    "Aarey Metro":              {"type": "metro", "lat": 19.1626, "lon": 72.8796, "line": "Metro-3", "tide_sensitive": False, "event_prone": False},
    "SEEPZ Metro":              {"type": "metro", "lat": 19.1150, "lon": 72.8696, "line": "Metro-3", "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🚌 BEST BUS STOPS & DEPOTS
    # ════════════════════════════════════════
    "Andheri Bus Depot":        {"type": "bus_stop", "lat": 19.1115, "lon": 72.8326, "line": "BEST", "tide_sensitive": False, "event_prone": False},
    "Kurla BEST Depot":         {"type": "bus_stop", "lat": 19.0714, "lon": 72.8775, "line": "BEST", "tide_sensitive": False, "event_prone": False},
    "Wadala Bus Depot":         {"type": "bus_stop", "lat": 19.0175, "lon": 72.8598, "line": "BEST", "tide_sensitive": False, "event_prone": False},
    "Backbay Bus Stop":         {"type": "bus_stop", "lat": 18.9285, "lon": 72.8305, "line": "BEST", "tide_sensitive": False, "event_prone": False},
    "Shivaji Park Bus Stop":    {"type": "bus_stop", "lat": 19.0258, "lon": 72.8376, "line": "BEST", "tide_sensitive": False, "event_prone": True},
    "Sion Bus Depot":           {"type": "bus_stop", "lat": 19.0418, "lon": 72.8634, "line": "BEST", "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🛺 AUTO / CAB ZONES
    # ════════════════════════════════════════
    "Andheri Auto Stand":       {"type": "auto_zone", "lat": 19.1180, "lon": 72.8468, "tide_sensitive": False, "event_prone": False},
    "Bandra Auto Stand":        {"type": "auto_zone", "lat": 19.0560, "lon": 72.8410, "tide_sensitive": False, "event_prone": False},
    "Dadar Auto Stand":         {"type": "auto_zone", "lat": 19.0190, "lon": 72.8462, "tide_sensitive": False, "event_prone": False},
    "Thane Auto Stand":         {"type": "auto_zone", "lat": 19.1867, "lon": 72.9717, "tide_sensitive": False, "event_prone": False},
    "Kurla Cab Zone":           {"type": "auto_zone", "lat": 19.0672, "lon": 72.8790, "tide_sensitive": False, "event_prone": False},
    "Airport Cab Zone T2":      {"type": "auto_zone", "lat": 19.0960, "lon": 72.8721, "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🛍️ MALLS & SHOPPING CENTRES
    # ════════════════════════════════════════
    "Phoenix Palladium":        {"type": "mall", "lat": 18.9952, "lon": 72.8258, "tide_sensitive": False, "event_prone": False},
    "Infinity Mall Andheri":    {"type": "mall", "lat": 19.1343, "lon": 72.8269, "tide_sensitive": False, "event_prone": False},
    "R-City Mall Ghatkopar":    {"type": "mall", "lat": 19.0862, "lon": 72.9148, "tide_sensitive": False, "event_prone": False},
    "Oberoi Mall Goregaon":     {"type": "mall", "lat": 19.1604, "lon": 72.8492, "tide_sensitive": False, "event_prone": False},
    "Viviana Mall Thane":       {"type": "mall", "lat": 19.2132, "lon": 72.9685, "tide_sensitive": False, "event_prone": False},
    "Inorbit Mall Malad":       {"type": "mall", "lat": 19.1781, "lon": 72.8453, "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🛒 MARKETS
    # ════════════════════════════════════════
    "Crawford Market":          {"type": "market", "lat": 18.9472, "lon": 72.8344, "tide_sensitive": False, "event_prone": False},
    "Linking Road Market":      {"type": "market", "lat": 19.0583, "lon": 72.8300, "tide_sensitive": False, "event_prone": False},
    "Colaba Causeway":          {"type": "market", "lat": 18.9148, "lon": 72.8289, "tide_sensitive": False, "event_prone": False},
    "Fashion Street":           {"type": "market", "lat": 18.9412, "lon": 72.8302, "tide_sensitive": False, "event_prone": False},
    "Dharavi Market":           {"type": "market", "lat": 19.0422, "lon": 72.8534, "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🏖️ BEACHES
    # ════════════════════════════════════════
    "Juhu Beach":               {"type": "beach", "lat": 19.1026, "lon": 72.8242, "tide_sensitive": True,  "event_prone": True},
    "Marine Drive":             {"type": "beach", "lat": 18.9438, "lon": 72.8231, "tide_sensitive": True,  "event_prone": False},
    "Girgaon Chowpatty":        {"type": "beach", "lat": 18.9545, "lon": 72.8153, "tide_sensitive": True,  "event_prone": True},
    "Aksa Beach":               {"type": "beach", "lat": 19.1870, "lon": 72.7970, "tide_sensitive": True,  "event_prone": False},
    "Versova Beach":            {"type": "beach", "lat": 19.1310, "lon": 72.8147, "tide_sensitive": True,  "event_prone": False},

    # ════════════════════════════════════════
    # 🕌 RELIGIOUS PLACES
    # ════════════════════════════════════════
    "Siddhivinayak Temple":     {"type": "religious", "lat": 19.0177, "lon": 72.8302, "tide_sensitive": False, "event_prone": True},
    "Haji Ali Dargah":          {"type": "religious", "lat": 18.9827, "lon": 72.8089, "tide_sensitive": True,  "event_prone": True},
    "Mahalaxmi Temple":         {"type": "religious", "lat": 18.9787, "lon": 72.8094, "tide_sensitive": False, "event_prone": True},
    "Mount Mary Church":        {"type": "religious", "lat": 19.0467, "lon": 72.8286, "tide_sensitive": False, "event_prone": True},
    "Iskcon Temple Juhu":       {"type": "religious", "lat": 19.1088, "lon": 72.8267, "tide_sensitive": False, "event_prone": True},

    # ════════════════════════════════════════
    # 🏢 OFFICE / BUSINESS ZONES
    # ════════════════════════════════════════
    "BKC":                      {"type": "office_zone", "lat": 19.0674, "lon": 72.8681, "tide_sensitive": False, "event_prone": False},
    "Nariman Point":            {"type": "office_zone", "lat": 18.9210, "lon": 72.8232, "tide_sensitive": False, "event_prone": False},
    "Lower Parel":              {"type": "office_zone", "lat": 18.9993, "lon": 72.8355, "tide_sensitive": False, "event_prone": False},
    "Powai":                    {"type": "office_zone", "lat": 19.1176, "lon": 72.9060, "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 📸 TOURISM / LANDMARKS
    # ════════════════════════════════════════
    "Gateway of India":         {"type": "tourism", "lat": 18.9220, "lon": 72.8347, "tide_sensitive": False, "event_prone": True},
    "Elephanta Caves":          {"type": "tourism", "lat": 18.9634, "lon": 72.9315, "tide_sensitive": True,  "event_prone": False},
    "Bandra-Worli Sea Link":    {"type": "tourism", "lat": 19.0378, "lon": 72.8178, "tide_sensitive": True,  "event_prone": False},

    # ════════════════════════════════════════
    # ✈️ AIRPORTS
    # ════════════════════════════════════════
    "CSIA Airport T1":          {"type": "airport", "lat": 19.0896, "lon": 72.8656, "tide_sensitive": False, "event_prone": False},
    "CSIA Airport T2":          {"type": "airport", "lat": 19.0895, "lon": 72.8680, "tide_sensitive": False, "event_prone": False},

    # ════════════════════════════════════════
    # 🏟️ STADIUMS
    # ════════════════════════════════════════
    "Wankhede Stadium":         {"type": "stadium", "lat": 18.9375, "lon": 72.8252, "tide_sensitive": False, "event_prone": True},
    "DY Patil Stadium":         {"type": "stadium", "lat": 19.0434, "lon": 73.0179, "tide_sensitive": False, "event_prone": True},
}

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate Haversine distance between two points in km."""
    import math
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def get_nearby_events(location_name, events_list, max_distance_km=10):
    """
    Filter events to only those within max_distance_km of the location.
    Returns events that are actually relevant to the location.
    """
    meta = get_location_metadata(location_name)
    if not meta or meta.get("type") == "unknown":
        return []  # Don't cite events for unknown locations
    
    loc_lat = meta.get("lat", 19.0760)
    loc_lon = meta.get("lon", 72.8777)
    
    nearby_events = []
    for event in events_list:
        if not isinstance(event, dict):
            continue
        
        # Check if event has location data
        event_lat = event.get("lat")
        event_lon = event.get("lon")
        
        # If event has no coordinates, check event name against location
        if event_lat is None or event_lon is None:
            event_name = event.get("name", "").lower()
            # Only include event if it's explicitly near this location
            loc_lower = location_name.lower()
            if any(word in event_name for word in loc_lower.split()):
                nearby_events.append(event)
            continue
        
        # Calculate distance
        distance = calculate_distance(loc_lat, loc_lon, event_lat, event_lon)
        if distance <= max_distance_km:
            event["distance_km"] = round(distance, 1)
            nearby_events.append(event)
    
    return nearby_events

# Signal Weights per Location Type
SIGNAL_WEIGHTS = {
    "railway":    {"hour": 0.9, "weather": 0.4, "traffic": 0.2, "tide": 0.0, "event": 0.6, "aqi": 0.1},
    "metro":      {"hour": 0.85, "weather": 0.3, "traffic": 0.3, "tide": 0.0, "event": 0.5, "aqi": 0.1},
    "transit_hub":{"hour": 0.8, "weather": 0.3, "traffic": 0.4, "tide": 0.0, "event": 0.5, "aqi": 0.1},
    "bus_stop":   {"hour": 0.75, "weather": 0.5, "traffic": 0.5, "tide": 0.0, "event": 0.4, "aqi": 0.2},
    "auto_zone":  {"hour": 0.8, "weather": 0.4, "traffic": 0.6, "tide": 0.0, "event": 0.3, "aqi": 0.1},
    "mall":       {"hour": 0.6, "weather": 0.6, "traffic": 0.4, "tide": 0.0, "event": 0.7, "aqi": 0.1},
    "office_zone":{"hour": 0.9, "weather": 0.2, "traffic": 0.3, "tide": 0.0, "event": 0.1, "aqi": 0.1},
    "beach":      {"hour": 0.5, "weather": 0.8, "traffic": 0.1, "tide": 0.9, "event": 0.7, "aqi": 0.3},
    "market":     {"hour": 0.7, "weather": 0.5, "traffic": 0.5, "tide": 0.0, "event": 0.8, "aqi": 0.2},
    "religious":  {"hour": 0.8, "weather": 0.3, "traffic": 0.2, "tide": 0.1, "event": 0.9, "aqi": 0.1},
    "tourism":    {"hour": 0.6, "weather": 0.6, "traffic": 0.3, "tide": 0.2, "event": 0.5, "aqi": 0.2},
    "airport":    {"hour": 0.7, "weather": 0.3, "traffic": 0.5, "tide": 0.0, "event": 0.2, "aqi": 0.1},
    "stadium":    {"hour": 0.3, "weather": 0.4, "traffic": 0.3, "tide": 0.0, "event": 1.0, "aqi": 0.1},
}

def get_location_metadata(location_name):
    return MUMBAI_LOCATIONS.get(location_name, {"type": "unknown", "tide_sensitive": False, "event_prone": False})

def get_weights(location_type):
    return SIGNAL_WEIGHTS.get(location_type, SIGNAL_WEIGHTS["railway"])
