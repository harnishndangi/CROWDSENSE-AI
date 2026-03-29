"""
Mumbai Crowd Patterns Knowledge Base
Compiled from web sources, traffic data, and police station statistics
"""

from datetime import datetime

# Crowd patterns from web sources
MUMBAI_CROWD_PATTERNS = {
    "rush_hours": {
        "morning": {"start": 8, "end": 11, "direction": "towards_south", "intensity": "extreme"},
        "evening": {"start": 17, "end": 20, "direction": "away_from_south", "intensity": "extreme"},
        "non_peak": {"hours": "12-16", "crowd_level": "moderate"}
    },
    "station_patterns": {
        # Western Line - Major Stations
        "Andheri": {
            "line": "Western",
            "type": "major_junction",
            "peak_intensity": "very_high",
            "crowd_factors": ["Metro interchange", "Commercial hub", "Office zone"],
            "typical_wait_time_peak": "15-25 minutes for train",
            "best_times": ["before_8am", "after_9pm"],
            "crowd_score_baseline": 85
        },
        "Borivali": {
            "line": "Western", 
            "type": "terminal",
            "peak_intensity": "extreme",
            "crowd_factors": ["Long-distance commuters", "Virar crowd accumulation"],
            "note": "Virar locals are legendary for extreme crowd",
            "crowd_score_baseline": 90
        },
        "Dadar": {
            "line": "Western_Central_interchange",
            "type": "major_junction",
            "peak_intensity": "extreme",
            "crowd_factors": ["Line interchange", "Central hub", "Multiple platforms"],
            "crowd_score_baseline": 95,
            "navigate_time": "10 minutes extra for foot over-bridges"
        },
        "Bandra": {
            "line": "Western",
            "type": "major_station",
            "peak_intensity": "very_high",
            "crowd_factors": ["Bandra-Kurla Complex access", "Commercial area"],
            "crowd_score_baseline": 80
        },
        # Central Line
        "Kurla": {
            "line": "Central_Harbour_interchange",
            "type": "major_junction",
            "peak_intensity": "extreme",
            "crowd_factors": ["Harbour line interchange", "Harbour industrial area"],
            "crowd_score_baseline": 88
        },
        "Ghatkopar": {
            "line": "Central_Metro_interchange",
            "type": "major_junction", 
            "peak_intensity": "very_high",
            "crowd_factors": ["Metro interchange", "Growing commercial area"],
            "crowd_score_baseline": 82
        },
        "Thane": {
            "line": "Central_transit_hub",
            "type": "major_transit_hub",
            "peak_intensity": "extreme",
            "crowd_factors": ["First major station outside Mumbai", "Daily commuter influx"],
            "crowd_score_baseline": 92
        },
        "Kalyan": {
            "line": "Central",
            "type": "beyond_city_limit",
            "peak_intensity": "high",
            "crowd_factors": ["Long-distance commuters", "Less frequent trains", "Express stop"],
            "crowd_score_baseline": 70,
            "note": "40km from South Mumbai, reduced frequency"
        },
        # Harbour Line
        "CSMT": {
            "line": "Central_terminus",
            "type": "terminus",
            "peak_intensity": "extreme",
            "crowd_factors": ["All lines terminate here", "Business district access"],
            "crowd_score_baseline": 95
        },
        "Wadala": {
            "line": "Harbour",
            "type": "junction",
            "peak_intensity": "moderate_high",
            "crowd_factors": ["BKC access", "Commercial area"],
            "crowd_score_baseline": 65
        },
        # Other key areas from police station data
        "Malwani": {
            "type": "residential",
            "traffic_challan_rank": 1,
            "crowd_factors": ["High traffic violations", "Dense residential"],
            "crowd_score_baseline": 75
        },
        "Dharavi": {
            "type": "industrial_residential",
            "traffic_challan_rank": 6,
            "crowd_factors": ["Industrial area", "High population density", "Worker influx"],
            "crowd_score_baseline": 78
        },
        "Powai": {
            "type": "corporate_hub",
            "crowd_factors": ["IT park", "Corporate offices", "Weekday peaks"],
            "crowd_score_baseline": 60,
            "peak_hours": "9-11am, 6-8pm weekdays only"
        },
        "BKC": {
            "type": "business_district",
            "crowd_factors": ["Major corporate hub", "Banks", "Offices"],
            "crowd_score_baseline": 55,
            "weekend_crowd": "very_low"
        },
        "Juhu": {
            "type": "recreational_residential",
            "crowd_factors": ["Beach area", "Residential", "Evening visitors"],
            "crowd_score_baseline": 50,
            "weekend_boost": 25
        },
        "Worli": {
            "type": "mixed",
            "crowd_factors": ["Sea link access", "Residential", "Commercial"],
            "crowd_score_baseline": 65
        },
        "Chembur": {
            "type": "residential_eastern",
            "traffic_challan_rank": 30,
            "crowd_factors": ["Eastern suburb", "Residential density"],
            "crowd_score_baseline": 68
        },
        "Sion": {
            "type": "transit_residential",
            "traffic_challan_rank": 77,
            "crowd_factors": ["Highway access", "Residential", "Transit point"],
            "crowd_score_baseline": 62
        }
    },
    # Sources from web research
    "sources": [
        {
            "url": "https://zolostays.com/blog/mumbai-local-trains-101-a-complete-beginners-guide/",
            "title": "Mumbai Local Trains 101- A Complete Beginner's Guide",
            "key_insights": [
                "Peak hours: 8:30-11:00 AM towards South, 5:30-8:30 PM away from South",
                "Virar locals are legendary for extreme crowd",
                "Dadar, Kurla, Parel are confusing junctions",
                "Non-peak hours 12-4 PM for beginners"
            ]
        },
        {
            "url": "https://timesofindia.indiatimes.com/long-distance-mumbai-local-commuters-face-daily-nightmare/articleshow/120032433.cms",
            "title": "Long-distance Mumbai local commuters face daily nightmare",
            "key_insights": [
                "Extreme overcrowding during peak hours",
                "Passengers forced to travel in unsafe conditions"
            ]
        },
        {
            "url": "https://en.wikipedia.org/wiki/Mumbai_Suburban_Railway",
            "title": "Mumbai Suburban Railway Wikipedia",
            "key_insights": [
                "EMUs are 12-car or 15-car formations",
                "Fast trains halt at major stations: Mumbai Central, Dadar, Bandra, Andheri, Borivali",
                "Slow trains halt at all stations"
            ]
        },
        {
            "url": "https://www.reddit.com/r/mumbai/comments/1790f4d/how_to_avoid_crowd_in_mumbai_local_trains/",
            "title": "Reddit: How to avoid crowd in Mumbai local trains?",
            "key_insights": [
                "Travel opposite rush hour direction when possible",
                "First Class crowds reduce after 9:40 am",
                "Look for trains starting from your station"
            ]
        }
    ]
}

# Traffic intensity from police station challan data (higher challan = more traffic violations = more crowd)
TRAFFIC_INTENSITY_FROM_CHALLAN_DATA = {
    "very_high": ["Malwani", "Khar", "N.M.Joshi", "Andheri", "Dharavi", "Borivali"],
    "high": ["Mulund", "R.A.K Marg", "Ghatkopar", "Pydhonie", "Malad", "Nagpada", 
             "Kandivali", "Kherwadi", "Jogeshawari", "Juhu"],
    "moderate": ["Meghwadi", "Dahisar", "Oshiwara", "Kasturba", "Amboli", "V.P.Road",
                 "Tilak Nagar", "Worli", "Navghar", "Byculla"],
    "low": ["Powai", "Sion", "Bandra", "Dadar", "Matunga", "Mahim"]
}

def get_crowd_pattern_for_location(location_name):
    """Get crowd pattern data for a specific location"""
    patterns = MUMBAI_CROWD_PATTERNS["station_patterns"]
    
    # Try exact match first
    if location_name in patterns:
        return patterns[location_name]
    
    # Try partial match
    for station, data in patterns.items():
        if station.lower() in location_name.lower() or location_name.lower() in station.lower():
            return data
    
    # Return default pattern
    return {
        "type": "unknown",
        "crowd_score_baseline": 55,
        "peak_intensity": "moderate",
        "crowd_factors": ["Standard Mumbai location"]
    }

def get_sources_for_judges():
    """Return sources for judges to verify crowd patterns"""
    return MUMBAI_CROWD_PATTERNS["sources"]

def calculate_crowd_score_with_patterns(location, hour, day_type, weather_data=None, traffic_data=None):
    """
    Calculate crowd score using Mumbai-specific crowd patterns
    """
    pattern = get_crowd_pattern_for_location(location)
    base_score = pattern.get("crowd_score_baseline", 55)
    
    # Rush hour adjustments
    is_weekend = day_type == "weekend"
    
    if not is_weekend:
        # Morning rush: 8-11am
        if 8 <= hour <= 11:
            if pattern.get("type") in ["major_junction", "transit_hub", "terminus"]:
                base_score += 25
            else:
                base_score += 15
        # Evening rush: 5-8pm  
        elif 17 <= hour <= 20:
            if pattern.get("type") in ["major_junction", "transit_hub", "terminus"]:
                base_score += 30
            else:
                base_score += 20
        # Late night
        elif hour < 6 or hour > 22:
            base_score -= 30
    else:
        # Weekend patterns
        loc_type = pattern.get("type")
        if loc_type in ["major_junction", "transit_hub", "railway", "metro"]:
            base_score -= 20  # Less crowd on weekends for transit
        elif loc_type in ["recreational_residential", "mixed", "market"]:
            if 10 <= hour <= 20:
                base_score += 20  # More crowd on weekends for recreational
    
    # Weather adjustments
    if weather_data:
        rain = weather_data.get("rain", 0)
        if rain > 2:
            loc_type = pattern.get("type")
            if loc_type in ["recreational", "market"]:
                base_score -= 20
            elif loc_type in ["transit_hub", "railway", "metro"]:
                base_score += 10  # More people take trains when it rains
    
    # Traffic data adjustments
    if traffic_data:
        congestion = traffic_data.get("congestion_ratio", 1.0)
        if congestion > 1.5:
            base_score += 15
        elif congestion > 1.2:
            base_score += 8
    
    return min(100, max(0, base_score))

# Export for use in other modules
__all__ = [
    'MUMBAI_CROWD_PATTERNS',
    'TRAFFIC_INTENSITY_FROM_CHALLAN_DATA', 
    'get_crowd_pattern_for_location',
    'get_sources_for_judges',
    'calculate_crowd_score_with_patterns'
]
