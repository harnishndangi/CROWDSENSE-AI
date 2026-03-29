import joblib
import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import LabelEncoder

# Paths
MODEL_PATH = r"c:\Users\HARNISH N DANGI\OneDrive\Desktop\Team_Technexis-Hack4Innovation-26\backend\model\crowd_model.pkl"
DATA_PATH = r"c:\Users\HARNISH N DANGI\OneDrive\Desktop\Team_Technexis-Hack4Innovation-26\backend\datasets\mumbai_master_dataset_v3.csv"

def test_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found at {MODEL_PATH}")
        return

    print("--- Loading Model and Reference Data ---")
    model = joblib.load(MODEL_PATH)
    df_ref = pd.read_csv(DATA_PATH, low_memory=False)

    features = [
        'day_of_week', 'hour', 'is_weekend', 'is_workday', 'zone', 
        'category', 'area_type', 'weather_condition', 'is_monsoon_season', 
        'is_public_holiday', 'temp', 'humidity', 'windspeed', 'precipprob', 
        'holiday_type', 'line_density'
    ]

    # Reconstruct exact LabelEncoders used during training
    les = {}
    for feature in features:
        if feature in df_ref.columns and df_ref[feature].dtype == 'object':
            le = LabelEncoder()
            le.fit(df_ref[feature].astype(str))
            les[feature] = le
        elif feature == 'holiday_type':
            le = LabelEncoder()
            le.fit(['None', 'Gazetted', 'Restricted'])
            les[feature] = le
        elif feature == 'weather_condition':
            # Need to handle potential unseen categories
            le = LabelEncoder()
            # Combine common ones with reference
            all_weather = list(df_ref['weather_condition'].unique()) + ['Cloudy', 'Monsoon/Rain', 'Clear', 'Clear/Cool']
            le.fit([str(x) for x in set(all_weather)])
            les[feature] = le
        elif feature == 'category':
            le = LabelEncoder()
            le.fit(df_ref['category'].astype(str))
            les[feature] = le

    # Helper to find closest category match
    def get_closest_category(cat_val, feature_name):
        options = les[feature_name].classes_
        if cat_val in options: return cat_val
        for opt in options:
            if cat_val.lower() in opt.lower() or opt.lower() in cat_val.lower():
                return opt
        return options[0]

    # Scenarios using values matched to dataset
    scenarios = [
        {
            "desc": "Peak Hour Weekday (Monday 9 AM, Normal Weather, Business Zone)",
            "data": {
                'day_of_week': 'Monday', 'hour': 9, 'is_weekend': 0, 'is_workday': 1,
                'zone': 'South Mumbai', 
                'category': get_closest_category('Commercial/Business District', 'category'), 
                'area_type': 'office',
                'weather_condition': get_closest_category('Clear/Cool', 'weather_condition'), 
                'is_monsoon_season': 0, 'is_public_holiday': 0,
                'temp': 28.0, 'humidity': 45.0, 'windspeed': 15.0, 'precipprob': 0,
                'holiday_type': 'None', 'line_density': 10
            }
        },
        {
            "desc": "Monsoon Evening (Friday 6 PM, Heavy Rain, Transit Hub)",
            "data": {
                'day_of_week': 'Friday', 'hour': 18, 'is_weekend': 0, 'is_workday': 1,
                'zone': 'Western Suburbs', 
                'category': get_closest_category('Transit Hub + Residential', 'category'), 
                'area_type': 'transit',
                'weather_condition': get_closest_category('Clear/Cool', 'weather_condition'), # Limited in dataset sample
                'is_monsoon_season': 1, 'is_public_holiday': 0,
                'temp': 24.0, 'humidity': 90.0, 'windspeed': 25.0, 'precipprob': 80,
                'holiday_type': 'None', 'line_density': 12
            }
        },
        {
            "desc": "Sunday Midnight Quiet (Sunday 1 AM, Residential)",
            "data": {
                'day_of_week': 'Sunday', 'hour': 1, 'is_weekend': 1, 'is_workday': 0,
                'zone': 'Central Mumbai', 
                'category': get_closest_category('Residential (Premium)', 'category'), 
                'area_type': 'residential',
                'weather_condition': get_closest_category('Clear/Cool', 'weather_condition'),
                'is_monsoon_season': 0, 'is_public_holiday': 0,
                'temp': 22.0, 'humidity': 40.0, 'windspeed': 10.0, 'precipprob': 0,
                'holiday_type': 'None', 'line_density': 8
            }
        }
    ]

    print("\n--- Running Prediction Tests ---")
    for scenario in scenarios:
        test_df = pd.DataFrame([scenario['data']])
        
        # Encode
        for feature in features:
            if feature in les:
                val = str(test_df[feature].iloc[0])
                if val not in les[feature].classes_:
                    # Fallback to first class if unseen
                    test_df[feature] = les[feature].transform([les[feature].classes_[0]])
                else:
                    test_df[feature] = les[feature].transform([val])
            
        prediction = model.predict(test_df[features])[0]
        print(f"Scenario: {scenario['desc']}")
        print(f"Predicted Crowd Score: {prediction:.2f}/100\n")

if __name__ == "__main__":
    test_model()
