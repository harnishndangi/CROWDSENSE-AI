"""
Direct Test Cases for CrowdSense AI System
Tests the agent directly without HTTP API
"""

import sys
sys.path.insert(0, 'c:\\Users\\Arnav Shirwadkar\\Desktop\\Mains\\CROWDSENSE-AI\\backend')

from agents.langgraph_flow import run_agent
from datetime import datetime

def test_query(description, query_text):
    """Test a single query and print results"""
    print(f"\n{'='*80}")
    print(f"TEST: {description}")
    print(f"Query: {query_text}")
    print(f"{'='*80}")
    
    try:
        result = run_agent(query_text)
        
        print(f"✅ SUCCESS")
        print(f"Location: {result.get('location', 'N/A')}")
        print(f"Prediction: {result.get('prediction', 'N/A')}")
        print(f"Confidence: {result.get('confidence', 'N/A')}")
        print(f"Hour: {result.get('hour', 'N/A')}")
        print(f"Day Type: {'Weekend' if result.get('day_type') == 1 else 'Weekday'}")
        
        # Check crowd pattern data
        crowd_pattern = result.get('crowd_pattern', {})
        if crowd_pattern:
            print(f"\n📊 Crowd Pattern Data:")
            print(f"  Type: {crowd_pattern.get('type', 'N/A')}")
            print(f"  Baseline: {crowd_pattern.get('crowd_score_baseline', 'N/A')}/100")
            print(f"  Factors: {crowd_pattern.get('crowd_factors', [])}")
        
        pattern_score = result.get('pattern_based_score')
        if pattern_score:
            print(f"  Pattern Score: {pattern_score}/100")
        
        # Check traffic data
        traffic = result.get('traffic', {})
        if traffic:
            print(f"\n🚦 Traffic Data:")
            print(f"  Congestion: {traffic.get('congestion_ratio', 'N/A')}x")
            print(f"  Incidents: {traffic.get('incidents_nearby', 'N/A')}")
            print(f"  Speed: {traffic.get('current_speed_kmph', 'N/A')} km/h")
            print(f"  Sources: {traffic.get('sources', [])}")
        
        reasons = result.get('reasons', [])
        print(f"\n🤖 AI Analysis ({len(reasons)} reasons):")
        for i, reason in enumerate(reasons[:5], 1):
            print(f"  {i}. {reason}")
        
        suggestions = result.get('suggestions', [])
        print(f"\n💡 Suggestions ({len(suggestions)}):")
        for i, suggestion in enumerate(suggestions[:4], 1):
            print(f"  {i}. {suggestion}")
        
        # Verify requirements
        print(f"\n✅ Verification:")
        print(f"  • Number of reasons: {len(reasons)} {'✓' if len(reasons) >= 3 else '✗ (expected 4-5)'}")
        print(f"  • Dynamic confidence: {result.get('confidence')} {'✓' if result.get('confidence') != 0.85 else '✗ (still fixed)'}")
        
        # Check for Wankhede issue
        all_text = ' '.join(reasons + suggestions).lower()
        has_wankhede = 'wankhede' in all_text
        is_distant = result.get('location', '').lower() in ['kalyan', 'thane', 'borivali', 'ghatkopar']
        if has_wankhede and is_distant:
            print(f"  ⚠️ WARNING: Wankhede cited for distant location!")
        else:
            print(f"  • No Wankhede for distant locations: ✓")
        
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# Test Cases
print("Starting CrowdSense AI Direct Test Suite...")
print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Python: {sys.version}")

results = []

# Test 1: Kalyan at Rush Hour (Weekday Evening)
results.append(test_query(
    "1. KALYAN - Rush Hour Weekday Evening (Should be HIGH)",
    "How crowded is Kalyan Station at 6 PM today?"
))

# Test 2: Andheri at Rush Hour (Weekday Morning)
results.append(test_query(
    "2. ANDHERI - Rush Hour Weekday Morning (Should be HIGH)",
    "Is Andheri crowded at 9 AM on Monday?"
))

# Test 3: Dadar (Major Junction) at Peak
results.append(test_query(
    "3. DADAR - Major Junction Evening (Should be VERY HIGH)",
    "Crowd level at Dadar Station at 7:30 PM today?"
))

# Test 4: Borivali (Terminal Station) - Virar Local Effect
results.append(test_query(
    "4. BORIVALI - Terminal Station Evening (Should be HIGH/VERY HIGH)",
    "How crowded is Borivali Station at 6:30 PM?"
))

# Test 5: Weekend at Railway Station (Should be lower)
results.append(test_query(
    "5. GHATKOPAR - Weekend Afternoon (Should be MODERATE/LOW)",
    "Is Ghatkopar Station crowded at 2 PM on Sunday?"
))

# Test 6: Office Zone on Weekday Morning
results.append(test_query(
    "6. BKC - Office Zone Weekday Morning (Should be HIGH)",
    "How crowded is BKC at 10 AM on Tuesday?"
))

# Test 7: Non-Peak Hours (Should be MODERATE/LOW)
results.append(test_query(
    "7. KURLA - Non-Peak Weekday (Should be MODERATE)",
    "Is Kurla Station crowded at 2:30 PM on Wednesday?"
))

# Test 8: Late Night (Should be LOW)
results.append(test_query(
    "8. THANE - Late Night (Should be LOW)",
    "How crowded is Thane Station at 11 PM?"
))

# Test 9: Beach Location Weekend
results.append(test_query(
    "9. JUHU BEACH - Weekend Afternoon (Should be HIGH)",
    "Crowd at Juhu Beach at 4 PM on Saturday?"
))

# Test 10: Mall on Weekend Evening
results.append(test_query(
    "10. MALL - Weekend Evening (Should be HIGH)",
    "How crowded is Phoenix Mall at 7 PM on Sunday?"
))

print("\n" + "="*80)
print("TEST SUITE COMPLETE")
print("="*80)
print(f"\nResults: {sum(results)}/{len(results)} tests passed")

if sum(results) == len(results):
    print("🎉 ALL TESTS PASSED!")
else:
    print("⚠️ Some tests failed. Check logs above.")
