import os
import pandas as pd

dataset_dir = r"c:\Users\HARNISH N DANGI\OneDrive\Desktop\Team_Technexis-Hack4Innovation-26\backend\datasets"

for root, dirs, files in os.walk(dataset_dir):
    for file in files:
        if file.endswith('.csv'):
            path = os.path.join(root, file)
            print(f"\n--- {path} ---")
            try:
                df = pd.read_csv(path, nrows=5)
                print("Columns:", df.columns.tolist())
            except Exception as e:
                print("Error reading:", e)
