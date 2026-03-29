import joblib
import numpy as np

try:
    encoders = joblib.load('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend/model/encoders.joblib')
    print("Searching for 'Kalyan' in encoders...")
    for k, le in encoders.items():
        if hasattr(le, 'classes_'):
            classes = le.classes_
            if any("Kalyan" in str(c) for c in classes):
                print(f"Found in key '{k}': {classes[np.where(np.char.find(classes.astype(str), 'Kalyan') >= 0)]}")
            else:
                pass
        else:
            print(f"Key '{k}' has no classes_ attribute.")
except Exception as e:
    print(f"Error: {e}")
