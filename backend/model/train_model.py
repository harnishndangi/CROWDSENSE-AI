import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score

# Paths
CURR_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.join(os.path.dirname(CURR_DIR), "datasets")
MODEL_DIR = CURR_DIR

def load_csv(path, encoding='utf-8'):
    try:
        return pd.read_csv(path, encoding=encoding, low_memory=False)
    except:
        return pd.read_csv(path, encoding='latin1', low_memory=False)

print("--- Loading Datasets ---")
# 1. Core Dataset
df_master = load_csv(os.path.join(BASE_DIR, "mumbai_master_dataset_v3.csv"))

# 2. Weather
df_weather = load_csv(os.path.join(BASE_DIR, "archive (6)", "rainfall.csv"))

# 3. Holidays
holiday_files = [os.path.join(BASE_DIR, "archive (9)", f"{y}.csv") for y in [2018, 2019, 2020, 2021]]
df_holidays_list = []
for f in holiday_files:
    if os.path.exists(f):
        df_holidays_list.append(load_csv(f))
df_holidays = pd.concat(df_holidays_list) if df_holidays_list else pd.DataFrame(columns=['date', 'holiday_type'])

# 4. Transit (Stations)
df_trains = load_csv(os.path.join(BASE_DIR, "archive (3)", "Mumbai Local Train Dataset.csv"))
station_counts = df_trains.groupby('Line').size().to_dict()

print("--- Merging Data ---")
df_master['date_only'] = pd.to_datetime(df_master['date']).dt.date
# Weather is DD-MM-YYYY
df_weather['datetime'] = pd.to_datetime(df_weather['datetime'], dayfirst=True, errors='coerce').dt.date
# Holiday is YYYY-MM-DD
df_holidays['date'] = pd.to_datetime(df_holidays['date'], errors='coerce').dt.date

# Aggregate Weather
weather_agg = df_weather.groupby('datetime').agg({
    'temp': 'mean',
    'humidity': 'mean',
    'windspeed': 'mean',
    'precipprob': 'mean'
}).reset_index()

# Merge Weather
df_merged = pd.merge(df_master, weather_agg, left_on='date_only', right_on='datetime', how='left')

# Merge Holidays
df_merged = pd.merge(df_merged, df_holidays[['date', 'holiday_type']], left_on='date_only', right_on='date', how='left')

# Fill missing
df_merged['holiday_type'] = df_merged['holiday_type'].fillna('None')
df_merged['temp'] = df_merged['temp'].fillna(df_merged['temp'].mean())
df_merged['humidity'] = df_merged['humidity'].fillna(df_merged['humidity'].mean())
df_merged['windspeed'] = df_merged['windspeed'].fillna(df_merged['windspeed'].mean())
df_merged['precipprob'] = df_merged['precipprob'].fillna(0)

# Add transit proxy
df_merged['line_density'] = df_merged['zone'].map(lambda x: station_counts.get(x, 5))

print("--- Preprocessing ---")
# Feature Selection
features = [
    'day_of_week', 'hour', 'is_weekend', 'is_workday', 'zone', 
    'category', 'area_type', 'weather_condition', 'is_monsoon_season', 
    'is_public_holiday', 'temp', 'humidity', 'windspeed', 'precipprob', 
    'holiday_type', 'line_density'
]
target = 'crowd_score_0_to_100'

X = df_merged[features].copy()
y = df_merged[target]

print("--- Saving Encoders ---")
encoders = {}
categorical_cols = X.select_dtypes(include=['object']).columns
for col in categorical_cols:
    le = LabelEncoder()
    # Refit because we need separate encoders for each column if we want to save them
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le

encoder_path = os.path.join(MODEL_DIR, "encoders.joblib")
joblib.dump(encoders, encoder_path)
print(f"Encoders saved to {encoder_path}")

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("--- Training Random Forest (Reduced Complexity for Pilot) ---")
model = RandomForestRegressor(n_estimators=10, random_state=42) # Reduced for quick integration
model.fit(X_train, y_train)

# Evaluation
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error: {mae:.2f}")
print(f"R2 Score: {r2:.2f}")

# Save Model
model_path = os.path.join(MODEL_DIR, "crowd_model.pkl")
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
print("--- Training Pipeline Complete ---")
