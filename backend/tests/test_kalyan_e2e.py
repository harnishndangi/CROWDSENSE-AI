import sys, os, json
sys.path.insert(0, 'c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend')

from agents.langgraph_flow import run_agent

query = "How crowded is Kalyan Station right now?"
print(f"Running: {query}")
res = run_agent(query)

output = {
    "location":    res.get("location"),
    "geo_info":    res.get("geo_info"),
    "hour":        res.get("hour"),
    "day_type":    res.get("day_type"),
    "weather":     res.get("weather"),
    "traffic":     res.get("traffic"),
    "tides":       res.get("tides"),
    "aqi":         res.get("aqi"),
    "prediction":  res.get("prediction"),
    "raw_score":   res.get("raw_score"),
    "confidence":  res.get("confidence"),
    "reasons":     res.get("reasons"),
    "suggestions": res.get("suggestions"),
    "trace":       res.get("reasoning_trace"),
}

with open('c:/Users/Kushal/Desktop/Team_Technexis-Hack4Innovation-26/backend/tests/kalyan_full_result.json', 'w') as f:
    json.dump(output, f, indent=2, default=str)

print("Done — results written to kalyan_full_result.json")
