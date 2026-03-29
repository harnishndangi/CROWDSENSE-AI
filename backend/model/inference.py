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

def predict_crowd(state: dict):
    """
    Predicts crowd score using the trained Random Forest model.
    Maps AgentState to model features.
    """
    model, encoders = load_resources()
    if model is None or encoders is None:
        print("Model or Encoders not loaded. Using fallback.")
        return None, 0.0

    # Features expected by the model
    features = [
        'day_of_week', 'hour', 'is_weekend', 'is_workday', 'zone', 
        'category', 'area_type', 'weather_condition', 'is_monsoon_season', 
        'is_public_holiday', 'temp', 'humidity', 'windspeed', 'precipprob', 
        'holiday_type', 'line_density'
    ]

    # Map state to raw feature dictionary
    # we need more context than just location/hour for a full prediction
    # If some are missing in state, we use defaults based on common Mumbai patterns
    
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
    
    # Use location metadata if available (from MUMBAI_LOCATIONS which langgraph_flow has)
    # Since we don't want to import it here to avoid circularity, we'll try to infer or use defaults
    
    # Raw data for prediction
    raw_data = {
        'day_of_week': 'Monday' if is_weekend == 0 else 'Sunday', # Simplified mapping
        'hour': hour,
        'is_weekend': is_weekend,
        'is_workday': is_workday,
        'zone': 'Western Suburbs' if 'Andheri' in loc else 'South Mumbai', # Simplified
        'category': 'Transit Hub + Residential' if 'Station' in loc else 'Commercial/Business District',
        'area_type': 'transit' if 'Station' in loc else 'office',
        'weather_condition': 'Clear/Cool', # Default
        'is_monsoon_season': 0,
        'is_public_holiday': 0,
        'temp': 28.0,
        'humidity': 60.0,
        'windspeed': 10.0,
        'precipprob': 0.0,
        'holiday_type': 'None',
        'line_density': 10
    }

    # Update with actual signals if available in state
    if state.get("weather"):
        w = state["weather"]
        if isinstance(w, dict):
            raw_data['temp'] = w.get('temp', 28.0)
            raw_data['humidity'] = w.get('humidity', 60.0)

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
        base_score = float(model.predict(df[features])[0])
        score = base_score
        
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
        
        return label, score
    except Exception as e:
        print(f"Prediction error: {e}")
        return None, 0.0
