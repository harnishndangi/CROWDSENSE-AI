import sys
import os

# Add root to sys.path
sys.path.append('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend')

from agents.langgraph_flow import run_agent

query = "Test crowd prediction for Kalyan Station at 4 PM today"
res = run_agent(query)

print(f"--- PREDICTION FOR KALYAN STATION ---")
print(f"Location: {res.get('location')}")
print(f"Intent: {res.get('intent')}")
print(f"Prediction: {res.get('prediction')}")
print(f"Confidence: {res.get('confidence')}")
print(f"Explanation:")
for r in res.get('reasons', []):
    print(f" - {r}")
print(f"Suggestions:")
for s in res.get('suggestions', []):
    print(f" - {s}")
print(f"Reasoning Trace: {res.get('reasoning_trace')}")
