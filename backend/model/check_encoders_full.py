import joblib
try:
    encoders = joblib.load('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend/model/encoders.joblib')
    for k, v in encoders.items():
        print(f"Key: {k}")
        if hasattr(v, 'classes_'):
            print(f"  Classes: {v.classes_}")
except Exception as e:
    print(f"Error: {e}")
