import sys
import os
import json

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.langgraph_flow import run_agent

def test_integration():
    print("=== CrowdSense Mumbai Integration Test ===")
    
    test_queries = [
        "What is the crowd level at Juhu Beach right now?",
        "How busy is Crawford Market on a Sunday afternoon?",
        "Is it crowded at Siddhivinayak Temple currently?",
        "When is the best time to visit BKC today?",
        "Compare Colaba Causeway and Bandra Linking Road crowd levels."
    ]
    
    for q in test_queries:
        print(f"\nQUERY: {q}")
        print("-" * 50)
        try:
            result = run_agent(q)
            
            # Basic validation
            print(f"INTENT: {result.get('intent')}")
            print(f"PREDICTION: {result.get('prediction')} (Confidence: {result.get('confidence')})")
            print(f"REASONS: {result.get('reasons')}")
            print(f"SUGGESTIONS: {result.get('suggestions')}")
            
            print("\nREASONING TRACE:")
            for step in result.get('reasoning_trace', []):
                print(f"  > {step}")
                
        except Exception as e:
            print(f"TEST FAILED: {str(e)}")
            
