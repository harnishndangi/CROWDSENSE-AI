from fastmcp import FastMCP
from tools.weather_tool import get_weather
from tools.traffic_tool import get_traffic
from tools.tide_tool import get_tides
from tools.event_tool import get_events
from tools.aqi_tool import get_aqi
from tools.x_tool import get_x_signals
from tools.mumbai_context import MUMBAI_LOCATIONS

# Initialize FastMCP Server
mcp = FastMCP("CrowdSense Mumbai")

@mcp.tool()
def fetch_weather(city: str = "Mumbai") -> dict:
    """Fetch live weather data for a city."""
    return get_weather(city)

@mcp.tool()
def fetch_traffic(origin: str, destination: str) -> dict:
    """Fetch live traffic and congestion levels between two points."""
    return get_traffic(origin, destination)

@mcp.tool()
def fetch_tides(location: str = "Juhu Beach") -> dict:
    """Fetch live tidal data for a Mumbai beach."""
    return get_tides(location)

@mcp.tool()
def fetch_events() -> list:
    """Fetch live public events and festivals in Mumbai."""
    return get_events()

@mcp.tool()
def fetch_aqi() -> dict:
    """Fetch live Air Quality Index (AQI) for Mumbai."""
    return get_aqi()

@mcp.resource("mumbai://locations")
def list_locations() -> str:
    """Get the list of supported locations in Mumbai."""
    return "\n".join(MUMBAI_LOCATIONS.keys())

@mcp.tool()
def fetch_x_signals(location: str):
    """Fetches real-time social signals (tweets) for a Mumbai location."""
    return get_x_signals(location)

if __name__ == "__main__":
    mcp.run()
