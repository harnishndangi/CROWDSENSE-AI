import sys
import os

sys.path.append('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend')
from agents.langgraph_flow import run_agent

res = run_agent("Kalyan Station prediction for 4 PM Saturday")
with open('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend/tests/kalyan_res.txt', 'w') as f:
    f.write(f"Prediction: {res.get('prediction')}\n")
    f.write(f"Confidence: {res.get('confidence')}\n")
    f.write(f"Reasons: {res.get('reasons')}\n")
    f.write(f"Suggestions: {res.get('suggestions')}\n")
