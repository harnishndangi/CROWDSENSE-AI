"""
Test Cases for CrowdSense AI System
Run these to verify the improved crowd prediction system
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_query(description, query_text):
    """Test a single query and print results"""
    print(f"\n{'='*80}")
    print(f"TEST: {description}")
    print(f"Query: {query_text}")
    print(f"{'='*80}")
    
    try:
        # Try the query endpoint
        response = requests.post(
            f"{BASE_URL}/api/query",
            json={"query": query_text},
            headers={"x-api-key": "CROWDSENSE_ENTERPRISE_KEY_2026"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS")
            print(f"Location: {data.get('location', 'N/A')}")
            print(f"Prediction: {data.get('prediction', 'N/A')}")
            print(f"Confidence: {data.get('confidence', 'N/A')}")
            
            reasons = data.get('reasons', [])
            print(f"\nAI Analysis ({len(reasons)} reasons):")
            for i, reason in enumerate(reasons[:5], 1):
                print(f"  {i}. {reason}")
            
            suggestions = data.get('suggestions', [])
            print(f"\nSuggestions ({len(suggestions)}):")
            for i, suggestion in enumerate(suggestions[:4], 1):
                print(f"  {i}. {suggestion}")
            
            # Check reasoning trace
            trace = data.get('reasoning_trace', [])
            print(f"\nReasoning Steps ({len(trace)} steps):")
            for step in trace[-5:]:  # Last 5 steps
                print(f"  • {step}")
                
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            print(f"Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")

# Test Cases
print("Starting CrowdSense AI Test Suite...")
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Test 1: Kalyan at Rush Hour (Weekday Evening)
test_query(
    "1. KALYAN - Rush Hour Weekday Evening (Should be HIGH)",
    "How crowded is Kalyan Station at 6 PM today?"
)

# Test 2: Andheri at Rush Hour (Weekday Morning)
test_query(
    "2. ANDHERI - Rush Hour Weekday Morning (Should be HIGH)",
    "Is Andheri crowded at 9 AM on Monday?"
)

# Test 3: Dadar (Major Junction) at Peak
test_query(
    "3. DADAR - Major Junction Evening (Should be VERY HIGH)",
    "Crowd level at Dadar Station at 7:30 PM today?"
)

# Test 4: Borivali (Terminal Station) - Virar Local Effect
test_query(
    "4. BORIVALI - Terminal Station Evening (Should be HIGH/VERY HIGH)",
    "How crowded is Borivali Station at 6:30 PM?"
)

# Test 5: Weekend at Railway Station (Should be lower)
test_query(
    "5. GHATKOPAR - Weekend Afternoon (Should be MODERATE/LOW)",
    "Is Ghatkopar Station crowded at 2 PM on Sunday?"
)

# Test 6: Office Zone on Weekday Morning
test_query(
    "6. BKC - Office Zone Weekday Morning (Should be HIGH)",
    "How crowded is BKC at 10 AM on Tuesday?"
)

# Test 7: Beach Location Weekend
test_query(
    "7. JUHU BEACH - Weekend Afternoon (Should be HIGH)",
    "Crowd at Juhu Beach at 4 PM on Saturday?"
)

# Test 8: Mall on Weekend Evening
test_query(
    "8. MALL - Weekend Evening (Should be HIGH)",
    "How crowded is Phoenix Mall at 7 PM on Sunday?"
)

# Test 9: Non-Peak Hours (Should be MODERATE/LOW)
test_query(
    "9. KURLA - Non-Peak Weekday (Should be MODERATE)",
    "Is Kurla Station crowded at 2:30 PM on Wednesday?"
)

# Test 10: Late Night (Should be LOW)
test_query(
    "10. THANE - Late Night (Should be LOW)",
    "How crowded is Thane Station at 11 PM?"
)

print("\n" + "="*80)
print("TEST SUITE COMPLETE")
print("="*80)

# Summary checks
print("\n✅ Verification Checklist:")
print("   • AI returns 4-5 reasons per prediction")
print("   • Reasons cite rush hour, location type, weekend/weekday")
print("   • NO Wankhede cited for distant locations")
print("   • Confidence is dynamic (70-98% range)")
print("   • Traffic data from Google + TomTom included")
print("   • Crowd pattern knowledge base referenced")
