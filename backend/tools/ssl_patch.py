import ssl
import os

def patch_ssl():
    """
    Globally bypasses SSL certificate verification to handle environments 
    with transparent proxies or broken certificate chains (common in some local networks).
    """
    try:
        # Check if already patched
        if getattr(ssl, '_create_unverified_context', None):
            ssl._create_default_https_context = ssl._create_unverified_context
            print("[CrowdSense] SSL Patch Applied: Global certificate verification disabled for demo.")
        
        # Also handle requests package
        os.environ['CURL_CA_BUNDLE'] = ''
        os.environ['REQUESTS_CA_BUNDLE'] = ''
    except Exception as e:
        print(f"[CrowdSense] SSL Patch Failed: {e}")

if __name__ == "__main__":
    patch_ssl()
