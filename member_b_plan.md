# Member B — Developer Plan
## Backend: LangGraph Agent + LLM Pipeline

**Stack:** `Python` · `LangChain` · `LangGraph` · `Groq LLM (llama-3.1-8b-instant)`

**Ownership:** External API tools (weather + traffic) · Mumbai context registry · All LLM prompt engineering · Full LangGraph agent pipeline

---

## Sync Checkpoints

| Checkpoint | Time | Your Deliverable |
|-----------|------|-----------------|
| CP-1 | Hour 3 | All 5 tools (`weather`, `traffic`, `tide`, `event`, `aqi`) return valid responses |
| CP-2 | Hour 8 | All LLM nodes handle 8+ input signals correctly — share sample reasoning traces |
| CP-3 | Hour 14 | Full agent pipeline working with tide-aware and event-triggered logic |

> Budget 20 minutes per checkpoint. No merging outside checkpoints.

---

## Phase 1 — Tool Scaffolding (Hours 0–3)

### Task 1: Register Groq API key
- [ ] Go to `console.groq.com`
- [ ] Confirm free tier is active
- [ ] Save key to `.env` as `GROQ_API_KEY`

### Task 2: Create `tools/weather_tool.py`
- [ ] Implement `get_weather(city)` calling OpenWeather API
- [ ] Set 3-second timeout on all calls
- [ ] Add in-memory fallback dict `FALLBACK_WEATHER` with Mumbai defaults
- [ ] Return dict: `{condition, temp, rain, source}` where `source = 'live'` or `'cached'`

### Task 3: Create `tools/traffic_tool.py`
- [ ] Implement `get_traffic(origin, destination)` using Google Maps Routes API
- [ ] Compute congestion ratio: `duration_in_traffic / duration`
- [ ] Map ratio to `0` (low) / `1` (medium) / `2` (high)
- [ ] Add in-memory fallback dict `FALLBACK_TRAFFIC` with per-location defaults

### Task 4: Create `tools/tide_tool.py`, `event_tool.py`, `aqi_tool.py`
- [ ] Implement `get_tides(lat, lon)` using WorldTides/Marea API (critical for Juhu/Marine Drive)
- [ ] Implement `get_events()` using PredictHQ API (tracks festivals/gatherings)
- [ ] Implement `get_aqi()` using AirVisual API
- [ ] Ensure all have 3s timeouts and robust `FALLBACK` dictionaries

### Task 5: Create `tools/mumbai_context.py`
- [ ] Define `MUMBAI_LOCATIONS` with 20+ places including `docs/dataset_inventory.md` mapping
  - Add `tide_sensitive: True` for beaches and `event_prone: True` for stadiums/temples
- [ ] Define `SIGNAL_WEIGHTS` including new signals (Tide, Event, AQI)

### ✅ Checkpoint B1
> All tool calls return valid responses — test with `print()`, share output with team

---

## Phase 2 — Agent Design + Prompt Engineering (Hours 3–8)

### Task 5: Set up LangChain with Groq LLM
- [ ] Model: `llama-3.1-8b-instant`
- [ ] `max_tokens=512`, `temperature=0.3` (low for consistency)
- [ ] Confirm LLM responds to a test prompt within 2 seconds

### Task 6: Design `ParseQuery` node
- [ ] Write prompt to extract `{location, hour, day_type}` from natural language
- [ ] Use LangChain output parser to return structured JSON
- [ ] Test: `"Will Andheri be crowded at 6 PM?"` → `{location: "Andheri Station", hour: 18, day_type: 0}`

### Task 8: Design `BuildExplanation` node
- [ ] Write prompt template with variables: `location`, `hour`, `crowd_label`, `weather`, `traffic`, `tide_level`, `is_event`, `aqi_index`
- [ ] Instruction: *"Explain crowd density using available signals. If tide is high at a beach or an event is nearby, highlight it as a primary driver."*
- [ ] Test with multiple location types — confirm output is always exactly 3 clean bullet reasons

### Task 8: Design `GenerateSuggestions` node
- [ ] Write prompt: *"Given Very High crowd at {location} at {hour}:00, suggest exactly 2 alternatives. Format: Alternative 1: [time or station]. Alternative 2: [time or station]."*
- [ ] Test that suggestions are **specific** — not generic ("try later") but named ("travel after 9 PM" or "use Jogeshwari instead")

### ✅ Checkpoint B2
> All three LLM nodes return valid structured output — share sample outputs with team

---

## Phase 3 — Full LangGraph Pipeline (Hours 8–14)

### Task 9: Build `agents/langgraph_flow.py` as full `StateGraph`

#### 9a: Define `AgentState` TypedDict
- [ ] Fields: `query`, `location`, `hour`, `day_type`, `weather`, `traffic`, `tides`, `events`, `aqi`, `prediction`, `confidence`, `reasons`, `suggestions`, `reasoning_trace`

#### 9b: Implement all node functions
- [ ] `parse_query` — NL query → structured params
- [ ] `fetch_signals` — calls ALL 5 tools (`weather`, `traffic`, `tides`, `events`, `aqi`)
- [ ] `run_prediction` — builds feature vector, calls sklearn model, returns `{label, confidence}`
- [ ] `build_explanation` — LLM prompt returns 3 Mumbai-specific reasons incorporating new signals
- [ ] Each node appends a step string to `reasoning_trace`

#### 9c: Wire graph
- [ ] Sequence: `parse_query → fetch_signals → run_prediction → build_explanation → generate_suggestions`
- [ ] Compile with `StateGraph.compile()`

### Task 10: Expose `run_agent` function
- [ ] `run_agent(query: str) → dict`
- [ ] This is what Member A's `/query` endpoint calls directly

### Task 11: Full end-to-end test
- [ ] Input: `"Will CST be crowded tomorrow morning at 8 AM?"`
- [ ] Expected: `prediction label + confidence + 3 reasons + 2 suggestions + reasoning_trace list`

### Task 12: Test fallback behaviour
- [ ] Temporarily disable Groq API key
- [ ] Confirm template fallback activates
- [ ] Confirm no crash, no error shown to user

### ✅ Checkpoint B3
> Full agent pipeline working end-to-end — demo to team with live reasoning trace visible

---

## Phase 4–6 — Wow Features + Polish (Hours 14–24)

### Task 13: Build best-time query handler
- [ ] When `ParseQuery` detects "best time" intent, route to `best_time` branch in graph
- [ ] Call `/best-time` API internally
- [ ] Format response: `"Top 3 windows: 9 AM (Low, 91%), 2 PM (Medium, 78%), 10 PM (Low, 88%)"`

### Task 14: Build multi-location compare query handler
- [ ] When `ParseQuery` detects "compare" or "least crowded" intent, call `/compare` API
- [ ] Format as ranked list with emoji-free crowd indicators

### Task 15: Add Tide & Event reasoning logic
- [ ] Add `TideLogic`: If `location_type == beach` and `tide == High`, force high crowd explanation (less space)
- [ ] Add `EventLogic`: Pull specific event names (e.g., "Ganesh Chaturthi at Girgaon") into the reasoning string
- [ ] Add `AQILogic`: Mention air quality impact for outdoor locations

---

## LangGraph Agent Flow Reference

```
ParseQuery       NL query → location + hour         LangChain LLMChain extracts structured params
     ↓
FetchSignals     location+hour → signals dict        Calls weather_tool + traffic_tool (3s timeout + fallback)
     ↓
RunPrediction    features → label + confidence       Calls sklearn model via feature vector
     ↓
BuildExplanation prediction → 3 reasons             LLM prompt with Mumbai context dict
     ↓
GenerateSuggestions all state → 2 alternatives      LLM returns time window or station swap
```

---

## Know for Demo Q&A

| Judge Question | Your Answer |
|---------------|-------------|
| Why not just Google it? | Google shows current crowding at popular places. We predict future crowd across ALL transport modes with reasoning — including bus stops, auto stands, and religious places Google doesn't cover. |
| What if your APIs fail? | 3-second timeout on all calls, falls back to cached signal. System never crashes. Live/Cached badge visible in UI. |
| Is this data real? | Synthetic data built on real Mumbai behavioral patterns — CR/WR peak hours, monsoon impact, festival spikes — plus live weather and traffic APIs. |
