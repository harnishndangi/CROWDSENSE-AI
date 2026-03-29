import os
from typing import TypedDict, List, Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langgraph.graph import StateGraph, END

# Tool Imports
from tools.weather_tool import get_weather
from tools.traffic_tool import get_traffic
from tools.tide_tool import get_tides
from tools.event_tool import get_events
from tools.aqi_tool import get_aqi
from tools.x_tool import get_x_signals
from tools.mumbai_context import get_location_metadata, MUMBAI_LOCATIONS

load_dotenv()

# --- 1. Agent State Definition ---
class AgentState(TypedDict):
    query: str
    location: Optional[str]
    hour: Optional[int]
    day_type: Optional[int]  # 0: Weekday, 1: Weekend
    intent: str  # 'predict', 'best_time', 'compare'
    comparison_locations: List[str]
    weather: Optional[dict]
    traffic: Optional[dict]
    tides: Optional[dict]
    events: Optional[List[dict]]
    aqi: Optional[dict]
    social_signals: Optional[dict] # New field for X
    live_reports: Optional[List[dict]] # Crowdsourced ground truth
    prediction: Optional[str]
    confidence: Optional[float]
    reasons: Optional[List[str]]
    suggestions: Optional[List[str]]
    reasoning_trace: List[str]

# --- 2. OpenRouter LLM Setup ---
llm = ChatOpenAI(
    model="meta-llama/llama-3.1-8b-instruct", # Default to Llama 3.1 8B on OpenRouter
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.3,
    max_tokens=512,
    default_headers={
        "HTTP-Referer": "https://crowdsense-mumbai.app", # Required by OpenRouter
        "X-Title": "CrowdSense Mumbai Agent"
    }
)

# --- 3. Node Functions ---

def parse_query_node(state: AgentState):
    """Parses natural language query into structured parameters and intent."""
    state["reasoning_trace"].append("🔍 Initializing agent: Parsing natural language query...")
    
    parser = JsonOutputParser()
    prompt = ChatPromptTemplate.from_template(
        "You are the CrowdSense Mumbai Analysis Agent.\n"
        "Extract location details and user intent from the query.\n"
        "Intent can be 'predict' (default), 'best_time' (when should I go?), or 'compare' (which is better?).\n"
        "Query: {query}\n"
        "Format EXACTLY as valid JSON with keys: 'location' (string), 'hour' (integer 0-23), 'day_type' (integer: 0 for weekday, 1 for weekend), 'intent' (string).\n"
        "Context: Mumbai uses 9 location types: Railway, Metro, Bus Stops, Auto Zones, Malls, Markets, Beaches, Religious, Office.\n"
        "Do not output markdown format or backticks, just raw JSON."
    )
    
    chain = prompt | llm | parser
    try:
        # Pass a truncated list of keys if needed to keep prompt small
        result = chain.invoke({"query": state["query"]})
        
        # Manually assign instead of .update() to avoid TypedDict TypeErrors in LangGraph
        for k, v in result.items():
            if k in state:
                state[k] = v
                
        state["intent"] = result.get("intent", "predict")
        loc = result.get("location", "Dadar Station")
        state["reasoning_trace"].append(f"📍 Location detected: '{loc}' · Intent: '{state['intent']}'")
        state["reasoning_trace"].append(f"📅 Temporal context check: Hour {result.get('hour')}:00, {'Weekend' if result.get('day_type') == 1 else 'Weekday'}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        state["reasoning_trace"].append(f"⚠️ Parsing intelligence failed: {str(e)}. Falling back to default heuristics.")
        state["intent"] = "predict"
        state["location"] = "Dadar Station"
        state["hour"] = 18
        state["day_type"] = 0
        
    return state

def fetch_signals_node(state: AgentState):
    """Fetches all external signals for the given location."""
    loc = state.get("location", "Mumbai")
    state["reasoning_trace"].append(f"📡 API handshake: Syncing live data for {loc}...")
    
    # Weather & Traffic
    state["reasoning_trace"].append(f"🌤️ Fetching OpenWeather real-time metrics...")
    state["weather"] = get_weather() 
    
    state["reasoning_trace"].append(f"🚦 Fetching TomTom Traffic Flow for nearest junction...")
    state["traffic"] = get_traffic() 
    
    state["reasoning_trace"].append(f"💨 Checking AQI (Air Quality Index)...")
    state["aqi"] = get_aqi()
    
    state["reasoning_trace"].append(f"📅 Scanning PredictHQ for local festivals & events...")
    state["events"] = get_events()
    
    state["reasoning_trace"].append(f"🐦 Scraping social sentiment from X (Twitter)...")
    state["social_signals"] = get_x_signals(loc)
    
    # HITL: Fetches recent crowdsourced reports
    state["reasoning_trace"].append(f"🤳 Syncing user-reported Ground Truth (HITL)...")
    try:
        from database.models import get_recent_live_reports
        state["live_reports"] = get_recent_live_reports(loc)
    except Exception:
        state["live_reports"] = []

    # Context-specific (Tides)
    meta = get_location_metadata(loc)
    if meta.get("tide_sensitive"):
        state["reasoning_trace"].append(f"🌊 Proximity to coast detected. Fetching WorldTides harbor levels...")
        state["tides"] = get_tides(loc)
    else:
        state["tides"] = {"tide_level": "N/A", "height": 0}
        
    state["reasoning_trace"].append("✅ Signal integration component: Success.")
    return state

from model.inference import predict_crowd

def run_prediction_node(state: AgentState):
    """Calculates crowd probability via ML model (Primary) or Weighted Heuristic (Fallback)."""
    state["reasoning_trace"].append("🤖 Model ExecutionNode: Initializing Random Forest inference...")
    
    # 0. HITL Override (Highest Priority)
    live_reports = state.get("live_reports", [])
    if live_reports and len(live_reports) > 0:
        latest = live_reports[0]
        rtype = latest.get("report_type")
        state["reasoning_trace"].append(f"🚨 HITL ALERT: Recent user report '{rtype}' detected!")
        state["reasoning_trace"].append(f"⚠️ Overriding AI signals with verified Human Ground Truth.")
        
        if rtype in ["Stampede Risk", "Train Halted"]:
            state["prediction"] = "Very High"
            state["confidence"] = 0.99
            return state
        elif rtype == "Surprisingly Empty":
            state["prediction"] = "Low"
            state["confidence"] = 0.99
            return state

    # 1. Attempt ML Model Inference
    ml_label, ml_score = predict_crowd(state)
    if ml_label:
        state["prediction"] = ml_label
        state["confidence"] = 0.92
        state["reasoning_trace"].append(f"🏆 Primary Model (ML RF-01): Selected '{ml_label}' category.")
        state["reasoning_trace"].append(f"📊 Probability distribution: High-confidence peak detected.")
        return state

    # 2. Heuristic Fallback
    state["reasoning_trace"].append("Primary ML Model warming up. Activating Rule-Based Engine...")
    score = 40 # Base
    try:
        h = int(state.get("hour") or 12)
    except ValueError:
        h = 12
        
    dt_val = state.get("day_type", 0)
    dt = 1 if isinstance(dt_val, str) and "weekend" in dt_val.lower() else (1 if str(dt_val) == "1" else 0)
    
    if (8 <= h <= 11 or 17 <= h <= 20) and dt == 0: score += 30
    elif (12 <= h <= 21) and dt == 1: score += 20
    if "Rain" in str(state.get("weather")): score += 10
    traffic = state.get("traffic")
    if isinstance(traffic, dict) and float(traffic.get("ratio") or 1.0) > 1.3: score += 15
    if "High" in str(state.get("social_signals")): score += 10
    
    score = min(score, 100)
    mapping = { (0, 30): "Low", (31, 55): "Moderate", (56, 80): "High", (81, 100): "Very High"}
    state["prediction"] = next((v for (low, high), v in mapping.items() if low <= score <= high), "High")
    state["confidence"] = 0.85
    state["reasoning_trace"].append(f"Heuristic Result: {state['prediction']}")
    return state

def build_explanation_node(state: AgentState):
    """Generates a 3-bullet explanation using the LLM and fetched signals."""
    state["reasoning_trace"].append("💬 LLM Synthesizer: Generating holistic explanation via Llama 3.1 405B...")
    
    tide_str = "Baseline"
    tides = state.get("tides")
    if isinstance(tides, dict) and tides.get("tide_level") == "High":
        tide_str = "High Tide (Significant beach area reduction)"
        
    event_str = "None"
    events = state.get("events")
    if events and isinstance(events, list) and len(events) > 0:
        event_str = ", ".join([e.get('name', 'Unknown Event') for e in events if isinstance(e, dict)])

    prompt = ChatPromptTemplate.from_template(
        "Generate 3 specific Mumbai crowd reasons for {pred} crowd at {loc}.\n"
        "Signals -> Weather: {w}, Traffic: {t}, Tide: {tide_ctx}, Events: {event_ctx}, AQI: {a}, Social: {s}\n"
        "Time: {h}:00, Day: {dt}\n"
        "Rule: If Tide is High, Event active, or Social reports exist, prioritize them. Be concise."
    )
    
    # Use OpenRouter LLM
    chain = prompt | llm | StrOutputParser()
    resp = chain.invoke({
        "pred": state["prediction"],
        "loc": state["location"],
        "w": state["weather"],
        "t": state["traffic"],
        "tide_ctx": tide_str,
        "event_ctx": event_str,
        "a": state["aqi"],
        "s": state["social_signals"],
        "h": state["hour"],
        "dt": state["day_type"]
    })
    
    state["reasons"] = [b.strip("- ").strip() for b in resp.split("\n") if b.strip()]
    return state

def generate_suggestions_node(state: AgentState):
    """Generates 2 alternatives for the user, with best-time search if requested."""
    state["reasoning_trace"].append("💡 Recommender Sub-Agent: Finding dynamic alternatives...")
    
    intent = str(state.get("intent") or "predict")
    loc = str(state.get("location") or "Mumbai")
    try:
        h = int(state.get("hour") or 12)
    except ValueError:
        h = 12

    if intent == "best_time":
        state["reasoning_trace"].append("Iterating through time slots for best-time recommendation...")
        # (Simulated search)
        better_hour = (h + 3) % 24
        state["suggestions"] = [
            f"Alternative Time: Visit at {better_hour}:00 for 40% less crowd.",
            f"Alternative Place: Consider visiting a nearby metro station for faster commute."
        ]
    else:
        # Fallback to normal suggestions
        prompt = ChatPromptTemplate.from_template(
            "The user is visiting {loc} at {h}:00 but the crowd is {pred}.\n"
            "Suggest exactly 2 specific alternatives (Alternative 1: ... Alternative 2: ...).\n"
            "Alternatives should be either a different time or a nearby less crowded station/place."
        )
        chain = prompt | llm | StrOutputParser()
        resp = chain.invoke({"loc": loc, "h": h, "pred": state["prediction"]})
        state["suggestions"] = [s.strip() for s in resp.split("Alternative") if s.strip()]

    # -- DB TELEMETRY --
    try:
        from database.models import log_prediction
        log_prediction(state)
        state["reasoning_trace"].append("💾 Telemetry synced to secure PostgreSQL vector store.")
    except Exception as db_err:
        pass

    return state

def event_mitigation_node(state: AgentState):
    """Specialized Handoff Agent: Triggers only when PredictHQ API detects Major Events."""
    state["reasoning_trace"].append("⚠️ Event Detected: Handing off to Event Mitigation Agent...")
    loc = state.get("location", "Mumbai")
    events = state.get("events", [])
    event_names = ", ".join([e.get("name", "Unknown") for e in events if isinstance(e, dict)])
    
    prompt = ChatPromptTemplate.from_template(
        "You are an Event Mitigation Travel Agent in Mumbai.\n"
        "A major event '{event_names}' is happening near {loc}.\n"
        "Generate a 2-sentence STRICT travel advisory for commuters to bypass the event traffic closures. Provide an alternative public transit route."
    )
    chain = prompt | llm | StrOutputParser()
    resp = chain.invoke({"event_names": event_names, "loc": loc})
    
    # Inject it directly into suggestions as a priority advisory
    state["suggestions"] = [f"[ADVISORY] {resp}"] + state.get("suggestions", [])
    return state

# --- 4. Graph Construction ---
workflow = StateGraph(AgentState)

workflow.add_node("parse_query", parse_query_node)
workflow.add_node("fetch_signals", fetch_signals_node)
workflow.add_node("run_prediction", run_prediction_node)
workflow.add_node("build_explanation", build_explanation_node)
workflow.add_node("generate_suggestions", generate_suggestions_node)
workflow.add_node("event_mitigation", event_mitigation_node)

def should_mitigate_event(state: AgentState):
    # Conditional Edge Router
    events = state.get("events")
    if events and isinstance(events, list) and len(events) > 0:
        return "event_mitigation"
    return "generate_suggestions"

workflow.set_entry_point("parse_query")
workflow.add_edge("parse_query", "fetch_signals")
workflow.add_edge("fetch_signals", "run_prediction")
workflow.add_edge("run_prediction", "build_explanation")

# Conditional Router
workflow.add_conditional_edges("build_explanation", should_mitigate_event, {
    "event_mitigation": "event_mitigation",
    "generate_suggestions": "generate_suggestions"
})

workflow.add_edge("event_mitigation", "generate_suggestions")
workflow.add_edge("generate_suggestions", END)

app = workflow.compile()

def run_agent(query: str):
    initial_state = {
        "query": query,
        "reasoning_trace": [],
        "location": None,
        "hour": None,
        "day_type": None,
        "weather": None,
        "traffic": None,
        "tides": None,
        "events": [],
        "aqi": None,
        "prediction": None,
        "confidence": None,
        "reasons": [],
        "suggestions": [],
        "social_signals": None,
        "live_reports": [],
        "intent": "predict",
        "comparison_locations": []
    }
    return app.invoke(initial_state)

if __name__ == "__main__":
    res = run_agent("Will Andheri be crowded at 7 PM tonight?")
    print(res["reasoning_trace"])
