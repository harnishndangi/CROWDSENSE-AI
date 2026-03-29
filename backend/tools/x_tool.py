"""
X (Twitter) Social Signals Tool - Simplified
Minimal implementation without fallbacks
"""

import os
from dotenv import load_dotenv

# Load from root .env
load_dotenv()

def get_x_signals(location="Mumbai"):
    """Minimal social signals - returns neutral if API unavailable"""
    token = os.getenv("X_BEARER_TOKEN")
    
    # Quick check if token exists and looks valid
    if not token or len(token) < 20 or "YOUR" in token.upper():
        return {"sentiment": "Neutral", "recent_reports": 0, "status": "No API"}
    
    # Try API call - no fallbacks, just return neutral on error
    try:
        import tweepy
        client = tweepy.Client(bearer_token=token)
        response = client.search_recent_tweets(
            query=f"{location} crowd OR traffic -is:retweet", 
            max_results=5
        )
        count = len(response.data) if response and response.data else 0
        
        return {
            "sentiment": "High" if count > 3 else "Moderate" if count > 1 else "Neutral",
            "recent_reports": count,
            "status": "Live"
        }
    except:
        # No fallback - just return neutral
        return {"sentiment": "Neutral", "recent_reports": 0, "status": "API Error"}

if __name__ == "__main__":
    print(get_x_signals("Andheri"))
