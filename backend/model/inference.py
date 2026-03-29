import os
import joblib
import pandas as pd
import numpy as np

# Paths
CURR_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURR_DIR, "crowd_model.pkl")
ENCODER_PATH = os.path.join(CURR_DIR, "encoders.joblib")

# Global variables for caching
_model = None
_encoders = None

def load_resources():
    global _model, _encoders
    if _model is None and os.path.exists(MODEL_PATH):
        _model = joblib.load(MODEL_PATH)
    if _encoders is None and os.path.exists(ENCODER_PATH):
        _encoders = joblib.load(ENCODER_PATH)
    return _model, _encoders


def _confidence_from_ml(score: float, tree_std: float, loc: str, loc_type: str) -> float:
    """
    Spread confidence across locations: label-margin clarity, forest disagreement,
    stable per-location jitter, and venue-type priors (transit vs leisure).
    """
    d_boundary = min(abs(score - 30), abs(score - 55), abs(score - 80))
    margin_clarity = min(1.0, d_boundary / 24.0)
    spread_norm = min(1.0, max(0.0, tree_std) / 18.0)
    agreement = 1.0 - spread_norm
    h = hash(loc) & 0xFFFFFFFF
    jitter = ((h % 2003) / 2003.0) * 0.16 - 0.08
    type_mod = {
        "railway": 0.05,
        "metro": 0.04,
        "transit_hub": 0.06,
        "bus_stop": 0.02,
        "beach": -0.07,
        "tourism": -0.06,
        "religious": 0.02,
        "office_zone": 0.03,
        "mall": 0.0,
        "market": 0.01,
        "auto_zone": -0.04,
        "airport": 0.04,
        "stadium": 0.02,
        "hospital": -0.02,
    }.get(loc_type, 0.0)
    conf = 0.45 + 0.32 * margin_clarity + 0.20 * agreement + jitter + type_mod
    if 38 <= score <= 62:
        conf -= 0.07
    return round(max(0.41, min(0.96, conf)), 2)


def predict_crowd(state: dict, location_metadata: dict = None):
    """
    Predicts crowd score using the trained Random Forest model.
    Maps AgentState to model features with proper location-specific context.
    Returns: (label, score, feature_values_array, confidence)
    """
    model, encoders = load_resources()
    if model is None or encoders is None:
        print("Model or Encoders not loaded. Using fallback.")
        return None, 0.0, None, None

    # Features expected by the model
    features = [
        'day_of_week', 'hour', 'is_weekend', 'is_workday', 'zone', 
        'category', 'area_type', 'weather_condition', 'is_monsoon_season', 
        'is_public_holiday', 'temp', 'humidity', 'windspeed', 'precipprob', 
        'holiday_type', 'line_density'
    ]

    # Extract from state
    loc = state.get("location", "Dadar Station")
    try:
        hour = int(state.get("hour") or 12)
    except ValueError:
        hour = 12
        
    # day_type in AgentState is 0: Weekday, 1: Weekend
    dt_val = state.get("day_type", 0)
    is_weekend = 1 if isinstance(dt_val, str) and "weekend" in dt_val.lower() else (1 if str(dt_val) == "1" else 0)
    is_workday = 1 if is_weekend == 0 else 0
    
    # Use location metadata for more accurate classification
    loc_type = "railway"
    zone = "Central Mumbai"
    area_type = "transit"
    line_density = 50
    
    if location_metadata:
        loc_type = location_metadata.get("type", "railway")
        lat = location_metadata.get("lat", 19.0760)
        lon = location_metadata.get("lon", 72.8777)
        
        # Zone classification based on coordinates
        if lat > 19.15:
            zone = "Northern Suburbs"
        elif lat < 19.0:
            zone = "South Mumbai"
        elif lon < 72.85:
            zone = "Western Mumbai"
        else:
            zone = "Eastern Suburbs"
            
        # Area type based on location type
        area_type_map = {
            "railway": "transit", "metro": "transit", "transit_hub": "transit",
            "bus_stop": "transit", "auto_zone": "mixed",
            "mall": "commercial", "market": "mixed", 
            "beach": "recreational", "tourism": "recreational",
            "religious": "cultural", "office_zone": "commercial",
            "hospital": "institutional", "airport": "transit",
            "stadium": "recreational"
        }
        area_type = area_type_map.get(loc_type, "mixed")
        
        # Line density based on location type
        density_map = {
            "railway": 85, "metro": 70, "transit_hub": 90, "bus_stop": 60,
            "auto_zone": 45, "mall": 55, "office_zone": 65, "market": 75,
            "beach": 40, "religious": 50, "tourism": 35, "airport": 80,
            "stadium": 70, "hospital": 60
        }
        line_density = density_map.get(loc_type, 50)
    else:
        # Fallback inference from location name
        loc_lower = loc.lower()
        if any(x in loc_lower for x in ["railway", "station", "stn"]):
            loc_type = "railway"
            zone = "Central Mumbai"
            line_density = 85
        elif any(x in loc_lower for x in ["metro"]):
            loc_type = "metro"
            zone = "Central Mumbai"
            line_density = 70
        elif any(x in loc_lower for x in ["beach", "chowpatty", "juhu", "marine"]):
            loc_type = "beach"
            zone = "South Mumbai" if "marine" in loc_lower or "chowpatty" in loc_lower else "Western Mumbai"
            line_density = 40
        elif any(x in loc_lower for x in ["mall", "phoenix", "infinity"]):
            loc_type = "mall"
            zone = "Western Mumbai"
            line_density = 55
        elif any(x in loc_lower for x in ["market", "bazaar"]):
            loc_type = "market"
            zone = "South Mumbai"
            line_density = 75
        elif any(x in loc_lower for x in ["temple", "mosque", "church", "mandir", "masjid"]):
            loc_type = "religious"
            zone = "South Mumbai"
            line_density = 50
        elif any(x in loc_lower for x in ["office", "bkc", "nariman"]):
            loc_type = "office_zone"
            zone = "South Mumbai" if "nariman" in loc_lower else "Eastern Suburbs"
            line_density = 65
        elif any(x in loc_lower for x in ["airport", "csmt", "cst"]):
            loc_type = "airport" if "airport" in loc_lower else "transit_hub"
            zone = "Northern Suburbs" if "airport" in loc_lower else "South Mumbai"
            line_density = 80
    
    # Category mapping based on location type
    category_map = {
        "railway": "Transit Hub + Residential",
        "metro": "Transit Hub + Mixed Use",
        "transit_hub": "Major Transit Interchange",
        "bus_stop": "Local Transit Node",
        "auto_zone": "Last-Mile Transit",
        "mall": "Commercial/Business District",
        "market": "Traditional Market Area",
        "beach": "Recreational/Leisure",
        "tourism": "Tourist Attraction",
        "religious": "Religious/Cultural Site",
        "office_zone": "Commercial/Business District",
        "hospital": "Medical/Institutional",
        "airport": "Air Transit Hub",
        "stadium": "Sports/Event Venue"
    }
    category = category_map.get(loc_type, "Mixed Use Area")

    # Determine current month for monsoon season (June-September)
    from datetime import datetime
    current_month = datetime.now().month
    is_monsoon = 1 if current_month in [6, 7, 8, 9] else 0
    
    # Day of week mapping
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    current_day = datetime.now().weekday()
    day_of_week = day_names[current_day]
    
    # Holiday type determination
    if is_weekend:
        holiday_type = "Weekend"
    else:
        # Simple check - could be enhanced with actual holiday calendar
        holiday_type = "None"
    
    # Raw data for prediction
    raw_data = {
        'day_of_week': day_of_week,
        'hour': hour,
        'is_weekend': is_weekend,
        'is_workday': is_workday,
        'zone': zone,
        'category': category,
        'area_type': area_type,
        'weather_condition': 'Clear/Cool',  # Default, updated below
        'is_monsoon_season': is_monsoon,
        'is_public_holiday': 1 if holiday_type != "None" else 0,
        'temp': 28.0,
        'humidity': 60.0,
        'windspeed': 10.0,
        'precipprob': 0.0,
        'holiday_type': holiday_type,
        'line_density': line_density
    }

    # Update with actual signals if available in state - WEATHER
    if state.get("weather"):
        w = state["weather"]
        if isinstance(w, dict):
            raw_data['temp'] = w.get('temp', 28.0)
            raw_data['humidity'] = w.get('humidity', 60.0)
            raw_data['windspeed'] = w.get('wind', 10.0) or w.get('windspeed', 10.0)
            raw_data['precipprob'] = w.get('rain', 0.0)
            # Update weather condition based on actual data
            condition = w.get('condition', 'Clear')
            if isinstance(condition, str):
                if 'rain' in condition.lower() or 'drizzle' in condition.lower():
                    raw_data['weather_condition'] = 'Rainy/Wet'
                elif 'cloud' in condition.lower():
                    raw_data['weather_condition'] = 'Cloudy'
                elif 'clear' in condition.lower() or 'sun' in condition.lower():
                    raw_data['weather_condition'] = 'Clear/Cool'
                elif 'haze' in condition.lower() or 'fog' in condition.lower():
                    raw_data['weather_condition'] = 'Hazy'
                else:
                    raw_data['weather_condition'] = condition

    # Convert to DataFrame
    df = pd.DataFrame([raw_data])

    # Encode categorical features
    for col, le in encoders.items():
        if col in df.columns:
            val = str(df[col].iloc[0])
            if val in le.classes_:
                df[col] = le.transform([val])
            else:
                # Fallback to first class if unseen
                df[col] = le.transform([le.classes_[0]])

    # Reorder columns to match model training
    try:
        # Extract the exact feature values that go into the model
        feature_values = df[features].iloc[0].tolist()
        
        Xf = df[features]
        base_score = float(model.predict(Xf)[0])
        score = base_score

        ests = getattr(model, "estimators_", None)
        if ests is not None and len(ests) > 0:
            tree_preds = np.array([float(est.predict(Xf)[0]) for est in ests])
            tree_std = float(np.std(tree_preds))
        else:
            tree_std = 10.0

        # --- AI SIGNAL AUGMENTATION ---
        # 1. Macro-Traffic Bias (Google Maps)
        if state.get("traffic"):
            ratio = float(state["traffic"].get("congestion_ratio", 1.0))
            score += (ratio - 1.0) * 15.0  

        # 2. Micro-Traffic Bias & Incidents (TomTom)
        if state.get("tomtom"):
            tt = state["tomtom"]
            if "incidents" in tt:
                incs = tt["incidents"].get("count", 0)
                score += (incs * 5.0)  # +5 density per active accident
            if "flow" in tt:
                flow_ratio = float(tt["flow"].get("congestion_ratio", 1.0))
                score += (flow_ratio - 1.0) * 10.0

        # Bound the score
        score = max(0.0, min(100.0, score))

        # Map augmented score to label
        if score < 30: label = "Low"
        elif score < 55: label = "Moderate"
        elif score < 80: label = "High"
        else: label = "Very High"

        confidence = _confidence_from_ml(score, tree_std, loc, loc_type)

        return label, score, feature_values, confidence
    except Exception as e:
        print(f"Prediction error: {e}")
        return None, 0.0, None, None
