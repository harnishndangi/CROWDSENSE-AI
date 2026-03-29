import sys, os, json, ssl
if (not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None)):
    ssl._create_default_https_context = ssl._create_unverified_context

sys.path.insert(0, 'c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend')

from agents.langgraph_flow import run_agent

# Target: Monday (Day after tomorrow) at 9 AM
query = "What will be the crowd at Koparkhairane Station this coming Monday at 9 AM?"
print(f"Running Future Prediction for: {query}")
res = run_agent(query)

output = {
    "query":       query,
    "location":    res.get("location"),
    "hour":        res.get("hour"),
    "day_type":    res.get("day_type"), # Should be 0 (Weekday)
    "prediction":  res.get("prediction"),
    "raw_score":   res.get("raw_score"),
    "confidence":  res.get("confidence"),
    "reasons":     res.get("reasons"),
    "suggestions": res.get("suggestions"),
    "trace":       res.get("reasoning_trace"),
}

target = 'c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend/tests/koparkhairane_future_res.json'
with open(target, 'w') as f:
    json.dump(output, f, indent=2, default=str)

print(f"Done — results written to {target}")
