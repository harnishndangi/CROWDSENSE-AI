import asyncio
from httpx import AsyncClient, ASGITransport
from main import app
import time

async def test_endpoint_concurrently(url, method="GET", json_body=None, num_calls=5):
    print(f"--- Load Testing {method} {url} with {num_calls} concurrent calls ---")
    
    # ASGITransport is needed for AsyncClient to test FastAPI app directly
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        
        async def make_request(i):
            start_time = time.time()
            if method == "GET":
                response = await ac.get(url)
            else:
                response = await ac.post(url, json=json_body)
            duration = time.time() - start_time
            print(f"Call {i+1}/{num_calls} - Status: {response.status_code} - Time: {duration:.4f}s")
            return duration
            
        tasks = [make_request(i) for i in range(num_calls)]
        times = await asyncio.gather(*tasks)
        
        avg_time = sum(times) / len(times)
        max_time = max(times)
        print(f"Average: {avg_time:.4f}s | Max: {max_time:.4f}s\n")
        
async def run_tests():
    await test_endpoint_concurrently("/health")
    await test_endpoint_concurrently("/compare?hour=9")
    await test_endpoint_concurrently("/best-time?location=Dadar%20Station&day_type=weekday")
    await test_endpoint_concurrently("/heatmap?location=Andheri%20West")
    await test_endpoint_concurrently("/query", method="POST", json_body={"query": "Is Dadar station crowded today?"})

if __name__ == "__main__":
    asyncio.run(run_tests())
