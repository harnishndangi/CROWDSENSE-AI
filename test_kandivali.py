#!/usr/bin/env python3
"""Test Kandivali crowd prediction for +4 hours and check API sources."""
import requests
import json
from datetime import datetime

future_hour = (datetime.now().hour + 4) % 24
current_hour = datetime.now().hour

print(f'Current time: {current_hour}:00')
print(f'Testing Kandivali Station for: {future_hour}:00 (+4 hours)')
print('='*60)

# Test the detailed query endpoint with API key
headers = {'X-API-Key': 'CROWDSENSE_ENTERPRISE_KEY_2026'}
body = {'query': f'What will be the crowd at Kandivali Station at {future_hour}:00?'}

try:
    response = requests.post('http://localhost:8000/query', json=body, headers=headers, timeout=15)
    print(f'Status: {response.status_code}')
    data = response.json()
    
    # Pretty print the response
    print(json.dumps(data, indent=2))
    
    # Check for source indicators
    print('\n' + '='*60)
    print('API SOURCE CHECK:')
    signals = data.get('signals', {})
    for key, value in signals.items():
        if isinstance(value, dict) and 'source' in str(value):
            source = value.get('source', 'unknown')
            print(f'  {key}: {source}')
        elif key in ['weather', 'traffic', 'aqi', 'tides', 'x_signals']:
            print(f'  {key}: {value}')
            
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
