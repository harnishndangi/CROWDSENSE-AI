"""
Crowd Cascade Propagation Engine
=================================
Models Mumbai's transit network as a directed graph.
When a station hits critical crowd levels, propagates predicted overflow
to connected stations with realistic travel-time delays.

Based on real Mumbai railway topology and typical passenger transfer patterns.
"""

import math
import time
from datetime import datetime
from typing import List, Dict, Optional

# ─── Mumbai Transit Graph ──────────────────────────────────────────────────────
# Format: station → [(connected_station, avg_travel_min, capacity_transfer_factor)]
# capacity_transfer_factor: what fraction of overflow passengers would go this route

MUMBAI_TRANSIT_GRAPH: Dict[str, List[tuple]] = {
    # Western Railway chain
    "Borivali Station":   [("Kandivali Station", 4, 0.9), ("Dahisar Station", 5, 0.8)],
    "Kandivali Station":  [("Malad Station", 4, 0.9), ("Borivali Station", 4, 0.5)],
    "Malad Station":      [("Goregaon Station", 5, 0.9), ("Kandivali Station", 4, 0.5)],
    "Goregaon Station":   [("Jogeshwari Station", 4, 0.9), ("Malad Station", 5, 0.5)],
    "Jogeshwari Station": [("Andheri Station", 5, 0.9), ("Goregaon Station", 4, 0.5)],
    "Andheri Station":    [("Vile Parle Station", 5, 0.8), ("Andheri Metro", 2, 0.4), ("Andheri Bus Depot", 3, 0.3)],
    "Vile Parle Station": [("Santacruz Station", 4, 0.9), ("Andheri Station", 5, 0.5)],
    "Santacruz Station":  [("Khar Road Station", 4, 0.9), ("Vile Parle Station", 4, 0.5)],
    "Khar Road Station":  [("Bandra Station", 5, 0.9), ("Santacruz Station", 4, 0.5)],
    "Bandra Station":     [("Mahim Station", 6, 0.8), ("Kurla Station", 12, 0.3)],
    "Mahim Station":      [("Matunga Station", 5, 0.9), ("Bandra Station", 6, 0.5)],
    "Matunga Station":    [("Dadar Station", 4, 0.9), ("Mahim Station", 5, 0.5)],
    "Dadar Station":      [("Matunga Station", 4, 0.5), ("Kurla Station", 14, 0.4), ("Andheri Station", 22, 0.3)],

    # Central Railway chain
    "CST / CSMT":         [("Kurla Station", 18, 0.7), ("Dadar Station", 14, 0.5)],
    "Kurla Station":      [("Ghatkopar Station", 8, 0.8), ("CST / CSMT", 18, 0.4), ("Dadar Station", 14, 0.3)],
    "Ghatkopar Station":  [("Mulund Station", 12, 0.8), ("Kurla Station", 8, 0.5), ("Ghatkopar Metro", 1, 0.3)],
    "Mulund Station":     [("Thane Station", 10, 0.9), ("Ghatkopar Station", 12, 0.5)],
    "Thane Station":      [("Mulund Station", 10, 0.6), ("Panvel Station", 35, 0.4)],

    # Metro intersections
    "Andheri Metro":      [("Chakala Metro", 5, 0.9), ("DN Nagar Metro", 5, 0.8)],
    "Ghatkopar Metro":    [("Chakala Metro", 10, 0.8), ("BKC Metro", 15, 0.4)],
    "Chakala Metro":      [("Andheri Metro", 5, 0.6), ("Ghatkopar Metro", 10, 0.6)],
    "BKC Metro":          [("Ghatkopar Metro", 15, 0.5), ("SEEPZ Metro", 12, 0.6)],

    # Bus & Auto feeders
    "Andheri Bus Depot":  [("Andheri Station", 3, 0.6), ("Andheri Metro", 4, 0.5)],
    "Kurla BEST Depot":   [("Kurla Station", 5, 0.7), ("Ghatkopar Station", 12, 0.4)],
}

# Zone classification for weighted pulse computation
ZONE_WEIGHTS = {
    "railway":    0.42,
    "transit_hub": 0.10,
    "metro":      0.22,
    "bus_stop":   0.15,
    "auto_zone":  0.06,
    "ferry":      0.03,
    "mall":       0.01,
    "office_zone": 0.005,
    "beach":      0.002,
    "market":     0.002,
    "religious":  0.002,
    "tourism":    0.002,
    "airport":    0.003,
    "stadium":    0.001,
}

# ─── Cascade Propagation ─────────────────────────────────────────────────────

def propagate_cascade(
    origin: str,
    initial_score: int,
    current_hour: int,
    max_hops: int = 3,
    overflow_threshold: int = 70
) -> List[Dict]:
    """
    BFS propagation from a congested origin station.
    Only propagates if initial_score >= overflow_threshold.
    Returns a list of CascadeWave dicts sorted by ETA.
    """
    if initial_score < overflow_threshold:
        return []

    visited = {origin}
    waves = []
    queue = [(origin, initial_score, 0, 1.0)]  # (station, score, eta_so_far, confidence)

    while queue:
        station, parent_score, eta_so_far, confidence = queue.pop(0)

        neighbors = MUMBAI_TRANSIT_GRAPH.get(station, [])
        for neighbor, travel_min, transfer_factor in neighbors:
            if neighbor in visited:
                continue
            visited.add(neighbor)

            # Decayed crowd score at the neighbor
            # Overflow passengers = (parent_score - 60) * transfer_factor
            overflow_load = max(0, (parent_score - 60) * transfer_factor)
            # Base load at neighbor is hour-dependent (simplified)
            base_load = _get_hour_base(neighbor, current_hour)
            predicted_surge = min(100, int(base_load + overflow_load * 0.7))

            arrival_eta = eta_so_far + travel_min
            hop_confidence = confidence * (0.85 ** (arrival_eta / 10))  # decay by distance

            waves.append({
                "station": neighbor,
                "predicted_surge": predicted_surge,
                "eta_minutes": arrival_eta,
                "confidence": round(hop_confidence, 2),
                "severity": _severity(predicted_surge),
                "overflow_source": origin,
            })

            # Only propagate further if this neighbor will also be congested
            if predicted_surge >= overflow_threshold and len(waves) < 10:
                queue.append((neighbor, predicted_surge, arrival_eta, hop_confidence))

    # Sort by ETA
    waves.sort(key=lambda w: w["eta_minutes"])
    return waves


def _get_hour_base(station: str, hour: int) -> float:
    """Simplified hour-based crowd base for a station."""
    # Railway stations peak at 8-10 and 17-20
    am_peak = 30 * math.exp(-0.5 * ((hour - 8.5) / 1.2) ** 2)
    pm_peak = 35 * math.exp(-0.5 * ((hour - 18) / 1.5) ** 2)
    base = 35
    return min(90, base + am_peak + pm_peak)


def _severity(score: int) -> str:
    if score >= 85: return "critical"
    if score >= 70: return "high"
    if score >= 50: return "moderate"
    return "low"


# ─── Mumbai Pulse Score ─────────────────────────────────────────────────────

def compute_network_pulse(location_scores: List[Dict]) -> Dict:
    """
    Aggregate all zone scores into a single 0-100 Mumbai Pulse score.
    Weighted by passenger throughput per transport mode.
    
    location_scores: list of {location, crowd_score, type}
    """
    if not location_scores:
        return {"pulse": 50, "status": "Unknown", "trend": "stable"}

    weighted_sum = 0.0
    weight_total = 0.0
    critical_zones = []
    safe_zones = []

    for item in location_scores:
        loc_type = item.get("type", "railway")
        score = item.get("crowd_score", 50)
        weight = ZONE_WEIGHTS.get(loc_type, 0.01)

        weighted_sum += score * weight
        weight_total += weight

        if score >= 80:
            critical_zones.append(item["location"])
        elif score <= 40:
            safe_zones.append(item["location"])

    # Normalise to 0-100
    pulse = int(round(weighted_sum / weight_total)) if weight_total > 0 else 50

    # Status label
    if pulse >= 80:
        status = "Critical"
        color = "#EF4444"
        advice = "Severe congestion city-wide. Consider delaying non-essential travel by 45-60 minutes."
    elif pulse >= 65:
        status = "Elevated"
        color = "#F97316"
        advice = "Above-average crowd pressure. Avoid top 3 critical zones. Use metro where possible."
    elif pulse >= 50:
        status = "Moderate"
        color = "#FDE047"
        advice = "Normal peak-hour load. Expect delays at major junctions. Plan extra 15 minutes."
    elif pulse >= 35:
        status = "Healthy"
        color = "#22C55E"
        advice = "City transit is flowing well. Good time to travel."
    else:
        status = "Clear"
        color = "#60A5FA"
        advice = "Very low crowd levels. Ideal time to travel across all modes."

    return {
        "pulse": pulse,
        "status": status,
        "color": color,
        "advice": advice,
        "critical_zone_count": len(critical_zones),
        "critical_zones": critical_zones[:5],
        "safe_zones": safe_zones[:5],
        "computed_at": datetime.now().isoformat(),
    }


# ─── Safety Score ────────────────────────────────────────────────────────────

def compute_safety_score(
    crowd_score: int,
    aqi: int,
    weather_condition: str,
    rain_mm: float,
    hitl_reports: int,
    tide_sensitive: bool,
    tide_height_m: float = 1.5
) -> Dict:
    """
    Composite 0-100 Safety Score per station.
    Higher = safer / more comfortable.
    """
    # Component penalties (each 0-100 penalty, then weighted)
    crowd_penalty = crowd_score  # Already 0-100

    # AQI penalty: 0 (good) to 100 (hazardous)
    aqi_penalty = min(100, max(0, (aqi - 50) * 0.8)) if aqi > 50 else 0

    # Weather penalty
    weather_penalties = {
        "Clear": 0, "Clouds": 5, "Haze": 10, "Mist": 10,
        "Drizzle": 20, "Rain": 35, "Thunderstorm": 60, "Light Rain": 20
    }
    weather_penalty = weather_penalties.get(weather_condition, 10)

    # Rain penalty (continuous)
    rain_penalty = min(40, rain_mm * 15) if rain_mm else 0

    # HITL reports penalty (each unresolved critical report = +8 penalty)
    hitl_penalty = min(40, hitl_reports * 8)

    # Tide penalty (only for coastal/tide-sensitive locations)
    tide_penalty = 0
    if tide_sensitive:
        if tide_height_m > 4.5:
            tide_penalty = 35
        elif tide_height_m > 3.5:
            tide_penalty = 18
        elif tide_height_m > 2.8:
            tide_penalty = 8

    # Weighted average of all penalties
    composite_penalty = (
        crowd_penalty    * 0.35 +
        aqi_penalty      * 0.20 +
        weather_penalty  * 0.15 +
        rain_penalty     * 0.10 +
        hitl_penalty     * 0.15 +
        tide_penalty     * 0.05
    )

    safety_score = max(0, min(100, int(100 - composite_penalty)))

    # Grade
    if safety_score >= 85: grade = "A+"
    elif safety_score >= 75: grade = "A"
    elif safety_score >= 65: grade = "B+"
    elif safety_score >= 55: grade = "B"
    elif safety_score >= 45: grade = "C"
    elif safety_score >= 35: grade = "D"
    else: grade = "F"

    grade_colors = {
        "A+": "#22C55E", "A": "#4ADE80", "B+": "#86EFAC",
        "B": "#FDE047", "C": "#F97316", "D": "#EF4444", "F": "#7f1d1d"
    }

    return {
        "safety_score": safety_score,
        "grade": grade,
        "color": grade_colors.get(grade, "#aaa"),
        "breakdown": {
            "crowd": round(crowd_penalty * 0.35),
            "aqi": round(aqi_penalty * 0.20),
            "weather": round(weather_penalty * 0.15),
            "rain": round(rain_penalty * 0.10),
            "incidents": round(hitl_penalty * 0.15),
            "tide": round(tide_penalty * 0.05),
        },
        "advice": _safety_advice(grade, crowd_score, weather_condition),
    }


def _safety_advice(grade: str, crowd_score: int, weather: str) -> str:
    if grade in ("A+", "A"):
        return "Excellent conditions. Safe and comfortable to travel now."
    elif grade == "B+":
        return "Good conditions. Minor crowding expected. Plan 10 extra minutes."
    elif grade == "B":
        if crowd_score >= 65:
            return "Moderate crowding. Consider metro alternatives if available."
        return "Slightly elevated conditions. Travel is manageable."
    elif grade == "C":
        return "Caution advised. Significant crowding or adverse weather. Add 20+ minutes buffer."
    elif grade == "D":
        return "Poor conditions. Heavy crowd or rain. Seek alternative modes if possible."
    else:
        return "Dangerous conditions. Avoid this location. Critical crowd or severe weather."
