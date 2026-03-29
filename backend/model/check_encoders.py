import joblib
import pandas as pd

try:
    encoders = joblib.load('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend/model/encoders.joblib')
    print("Keys in encoders:", encoders.keys())
    if 'Location' in encoders:
        print("Classes in Location encoder:", encoders['Location'].classes_)
except Exception as e:
    print(f"Error: {e}")
