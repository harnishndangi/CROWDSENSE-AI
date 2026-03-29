import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(name, method, endpoint, payload=None, params=None):
    print(f"--- Testing {name} ({method} {endpoint}) ---")
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", params=params)
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=payload)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response:")
            # Use json.dumps for pretty printing if it is JSON
            try:
                print(json.dumps(response.json(), indent=2))
            except:
                print(response.text)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")
    print("-" * 50)

def run_all_tests():
    # 1. Health check
    test_endpoint("Health", "GET", "/health")
    
    # 2. Model Info
    test_endpoint("Model Info", "GET", "/model-info")
    
    # 3. /predict
    test_endpoint("Predict", "GET", "/predict", params={"location": "Dadar Station", "hour": 9})
    
    # 4. /query (Agentic)
    test_endpoint("Agent Query", "POST", "/query", payload={"query": "Is Dadar station crowded at 9 AM?"})
    
    # 5. /compare
    test_endpoint("Compare Locations", "GET", "/compare", params={"hour": 9})
    
    # 6. /best-time
    test_endpoint("Best Time", "GET", "/best-time", params={"location": "Andheri West", "day_type": "weekday"})
    
    # 7. /heatmap
    test_endpoint("Heatmap", "GET", "/heatmap", params={"location": "Colaba"})

if __name__ == "__main__":
    run_all_tests()
