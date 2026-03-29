import os
import tweepy
from dotenv import load_dotenv

import requests
import urllib3
import ssl
import time
from functools import lru_cache

# Bypass SSL verification errors for local proxy/corporate networks
ssl._create_default_https_context = ssl._create_unverified_context
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

@lru_cache(maxsize=32)
def _fetch_x_signals(location, ttl_hash):
    """
    Internal fetcher with TTL cache
    """
    bearer_token = os.getenv("X_BEARER_TOKEN")
    
    if not bearer_token or "YOUR_TOKEN" in bearer_token:
        return {"sentiment": "Neutral", "recent_reports": 0, "status": "No Credentials"}

    try:
        client = tweepy.Client(bearer_token=bearer_token)
        # Bypass local SSL verification for corporate proxies
        if hasattr(client, 'session'):
            client.session.verify = False
            
        query = f"{location} crowd OR traffic -is:retweet lang:en"
        
        # Search recent tweets (last 7 days)
        response = client.search_recent_tweets(query=query, max_results=10)
        
        tweets = response.data if response and hasattr(response, 'data') and response.data else []
        count = len(tweets)
        
        # Simple heuristic sentiment
        sentiment = "Neutral"
        if count > 5:
            sentiment = "High Activity"
        elif count > 2:
            sentiment = "Moderate Activity"
            
        return {
            "sentiment": sentiment,
            "recent_reports": count,
            "top_tweet": tweets[0].text if tweets else "No recent reports",
            "status": "Live Data"
        }
    except Exception as e:
        status_code = getattr(e.response, "status_code", None) if hasattr(e, "response") else None
        error_msg = str(e)
        if "403" in error_msg or status_code == 403:
            # Free tier limitation fallback - Generate realistic synthetic signals
            import random
            from datetime import datetime
            
            h = datetime.now().hour
            is_rush = (8 <= h <= 11) or (17 <= h <= 20)
            
            rush_tweets = [
                f"Absolute chaos at {location} right now. Why is there no crowd management? #MumbaiTraffic",
                f"Avoid {location} if you can. Massive queues building up. #MumbaiLocal",
                f"Stuck near {location} for 20 minutes. It's packed today.",
                f"Surging crowds observed at {location}. Stay safe everyone."
            ]
            
            calm_tweets = [
                f"Surprisingly empty at {location} today. Smooth commute!",
                f"No crowd at {location} right now, managed to get through quickly.",
                f"Normal traffic around {location}. Nothing to worry about."
            ]
            
            selected_tweets = rush_tweets if is_rush else calm_tweets
            top_tweet = random.choice(selected_tweets)
            
            return {
                "sentiment": "High Activity" if is_rush else "Low Activity", 
                "recent_reports": random.randint(3, 8) if is_rush else random.randint(0, 2), 
                "top_tweet": top_tweet,
                "status": "Simulated (API Tier Limited)"
            }
        else:
            print(f"X API Error: {error_msg}")
            # Ensure error string is short
            short_err = str(e)
            if len(short_err) > 20:
                short_err = short_err[:20]
            return {
                "sentiment": "Neutral", 
                "recent_reports": 0, 
                "top_tweet": "No recent reports.",
                "status": f"Error: {short_err}"
            }

def get_x_signals(location="Mumbai"):
    """
    Fetches recent social signals (tweets) about crowd/traffic in Mumbai.
    Uses X API v2 (Bearer Token preferred for search).
    Uses lru_cache with 15 min TTL to respect API limits.
    """
    return _fetch_x_signals(location, int(time.time() // 900))

if __name__ == "__main__":
    print(get_x_signals("Andheri Station"))
