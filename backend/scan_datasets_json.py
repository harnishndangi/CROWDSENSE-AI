import os
import pandas as pd
import json

dataset_dir = r"c:\Users\HARNISH N DANGI\OneDrive\Desktop\Team_Technexis-Hack4Innovation-26\backend\datasets"
result = {}

for root, dirs, files in os.walk(dataset_dir):
    for file in files:
        if file.endswith('.csv'):
            path = os.path.join(root, file)
            print("Scanning:", file)
            try:
                # Try encoding latin1 if utf-8 fails
                try:
                    df = pd.read_csv(path, nrows=1)
                except UnicodeDecodeError:
                    df = pd.read_csv(path, nrows=1, encoding='latin1')
                result[file] = {
                    "path": path,
                    "columns": df.columns.tolist()
                }
            except pd.errors.EmptyDataError:
                result[file] = {"path": path, "error": "Empty data"}
            except Exception as e:
                result[file] = {"path": path, "error": str(e)}

with open('dataset_info.json', 'w') as f:
    json.dump(result, f, indent=4)
