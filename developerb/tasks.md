# Member B - Granular Task List

## Phase 1 — Tool Scaffolding & External Signals
- [x] 1.1 Environment & API Key Setup
    - [x] Create/Verify `.env` in `backend/`
    - [x] Add `GROQ_API_KEY`
    - [x] Add `OPENWEATHER_API_KEY`
    - [x] Add `GOOGLE_MAPS_API_KEY`
    - [x] Add `WORLD_TIDES_API_KEY` (or Marea)
    - [x] Add `PREDICT_HQ_API_KEY`
- [x] 1.2 Implement `tools/weather_tool.py`
    - [x] Define `get_weather(city)` with `requests`
    - [x] Add 3s timeout handling
    - [x] Add `FALLBACK_WEATHER` dict for Mumbai
    - [x] Return structured dict with `status` (live/cached)
- [x] 1.3 Implement `tools/traffic_tool.py`
    - [x] Define `get_traffic(origin, destination)` using Google Maps Routes API
    - [x] Calculate congestion ratio (traffic_duration / duration)
    - [x] Map ratio to levels 0-2 (Low, Medium, High)
    - [x] Add `FALLBACK_TRAFFIC` logic
- [x] 1.4 Implement `tools/tide_tool.py`
    - [x] Define `get_tides(lat, lon)` using WorldTides API
    - [x] Filter for high-tide windows in the next 24 hours
    - [x] Add Mumbai-specific beach coordinates mapping
    - [x] Add `FALLBACK_TIDES`
- [x] 1.5 Implement `tools/event_tool.py`
    - [x] Define `get_events()` using PredictHQ
    - [x] Filter for "Mumbai" and "Public Gathering / Festival" categories
    - [x] Implement query caching to minimize API hits
- [x] 1.6 Implement `tools/aqi_tool.py`
    - [x] Define `get_aqi()` using AirVisual API
    - [x] Map AQI numbers to labels (Good, Moderate, Poor)
- [x] 1.7 Implement `tools/mumbai_context.py`
    - [x] Build `MUMBAI_LOCATIONS` registry (20+ places)
    - [x] Assign `tide_sensitive: True` & `event_prone: True` flags
    - [x] Define `SIGNAL_WEIGHTS` for (Hour, Weather, Traffic, Tide, Event, AQI)
- [x] 1.8 Implement MCP Server (`backend/mcp_server.py`)
    - [x] Initialize `mcp.server.fastmcp.FastMCP`
    - [x] Wrap all tools from 1.2-1.6 as `@mcp.tool()`
    - [x] Expose Mumbai-specific resources (e.g., location list) via `@mcp.resource()`

## Phase 2 — Agent Component Design
- [x] 2.1 LLM Configuration
    - [x] Initialize `ChatGroq` with `llama-3.1-8b-instant`
    - [x] Set low temperature (0.3) for consistency
- [x] 2.2 `ParseQuery` Node
    - [x] Create system prompt for entity extraction (location, time, day_type)
    - [x] Implement JSON output parser
    - [x] Add few-shot examples for Mumbai slang/shorthand
- [x] 2.3 `BuildExplanation` Node
    - [x] Create prompt template for 3-bullet explanations
    - [x] Inject multi-signal context into prompt
    - [x] Add persona instructions: "Be a helpful Mumbai local guide"
    - [x] Update prompt to include Social signals:
        prompt = ChatPromptTemplate.from_template(
            "Generate 3 specific Mumbai crowd reasons for {pred} crowd at {loc}.\n"
            "Signals -> Weather: {w}, Traffic: {t}, Tide: {tide_ctx}, Events: {event_ctx}, AQI: {a}, Social: {s}\n"
            "Time: {h}:00, Day: {dt}\n"
            "Rule: If Tide is High, Event active, or Social reports exist, prioritize them. Be concise."
        )
        
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
- [x] 2.4 `GenerateSuggestions` Node
    - [x] Create prompt for 2 specific alternatives (time or location)
    - [x] Ensure suggestions are actionable (e.g., "Use Metro Line 3 instead")

## Phase 3 — LangGraph Pipeline Construction
- [x] 3.1 Define `AgentState`
    - [x] Use `TypedDict` for state tracking
    - [x] Include all signal fields + reasoning_trace
- [x] 3.2 Implement Node Functions in `agents/langgraph_flow.py`
    - [x] `parse_query_node`
    - [x] `fetch_signals_node` (Parallel tool calls)
    - [x] `predict_crowd_node` (Call Member A's model)
    - [x] `explain_node`
    - [x] `suggest_node`
- [x] 3.3 Graph Wiring
    - [x] Define edges and entry/exit points
    - [x] Compile graph with memory (optional)
- [x] 3.4 API Entry Point
    - [x] Export `run_agent(query)` function for FastAPI integration

## Phase 4 — Advanced Logic & Polish
- [x] 4.1 Intent Detection Logic (Best-Time, Compare)
    - [x] Update `parse_query_node` to handle multiple intents
- [x] 4.5 Weighted Heuristic Prediction Engine
    - [x] Implement signal-based scoring in `predict_crowd_node`
- [x] 4.6 Best-Time Search Logic
    - [x] Iterate through time slots for optimal travel window

## Phase 5 — OpenRouter & X Migration
- [x] 5.1 Implement `x_tool.py`
    - [x] Connectivity with `tweepy`
    - [x] Search query for "Mumbai crowd/traffic"
- [x] 5.2 Migrate Agent to OpenRouter
    - [x] Switch `ChatGroq` to `ChatOpenAI` adapter
    - [x] Configure base URL and required headers
- [x] 5.3 Integrate Social Signals
    - [x] Add `social_signals` to `AgentState`
    - [x] Update Explanation prompt to include Twitter reports
