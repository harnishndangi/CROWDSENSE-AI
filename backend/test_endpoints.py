import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_query():
    print("Testing /query endpoint...")
    response = client.post("/query", json={"query": "Is Dadar station crowded today?"})
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
    print("-" * 40)

def test_compare():
    print("Testing /compare endpoint...")
    response = client.get("/compare?hour=9")
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
    print("-" * 40)

def test_best_time():
    print("Testing /best-time endpoint...")
    response = client.get("/best-time?location=Dadar%20Station&day_type=weekday")
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
    print("-" * 40)

def test_heatmap():
    print("Testing /heatmap endpoint...")
    response = client.get("/heatmap?location=Andheri%20West")
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2))
    print("-" * 40)

if __name__ == "__main__":
    test_query()
    test_compare()
    test_best_time()
    test_heatmap()
