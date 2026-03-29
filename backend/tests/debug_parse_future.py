import sys, os
sys.path.insert(0, 'c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend')

from agents.langgraph_flow import run_agent

# Test the query that failed
query = "What will be the crowd at Koparkhairane Station this coming Monday at 9 AM?"
print(f"Testing Query: {query}")
res = run_agent(query)
print(f"Parsed Location: {res.get('location')}")
print(f"Parsed Hour: {res.get('hour')}")
print(f"Parsed Day Type: {res.get('day_type')}")
print(f"Full Trace: {res.get('reasoning_trace')}")
