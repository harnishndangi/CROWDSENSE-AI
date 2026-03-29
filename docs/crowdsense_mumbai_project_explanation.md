# 🏙️ CrowdSense Mumbai
## *"Know Before You Go."*

> **AI-powered crowd density prediction for Mumbai's trains, metros, buses, beaches, temples, and markets — with natural language querying, live signal fusion, and explainable AI reasoning.**

---

## 🔴 The Problem — Why This Matters

Mumbai is the most densely populated city in India. Every single day:

- **8 million+ commuters** ride the Mumbai local train network (Central Railway + Western Railway)
- **40% of them** arrive at stations during the wrong time window — experiencing severe overcrowding they could have avoided
- **BEST buses, Mumbai Metro, auto-rickshaw zones, religious sites, and popular beaches** all face the same unmanaged peak-hour chaos

**The root cause:** People have no way to *predict* future crowd levels — only react to them in the moment.

> Google Maps, Apple Maps, and existing apps tell you **how crowded a place is RIGHT NOW**.
> **CrowdSense Mumbai tells you how crowded it will be — an hour from now, tomorrow, or next weekend — and WHY, in plain language.**

This is the shift from **real-time estimation → predictive intelligence**.

No CCTV. No sensors. No hardware deployments. Just data, machine learning, and AI reasoning.

---

## 💡 The Solution — What We Built

**CrowdSense Mumbai** is a full-stack AI platform that combines:

1. A **trained Machine Learning model** (Random Forest Regressor) that predicts crowd intensity at any Mumbai location for any hour of the day
2. A **multi-signal AI Agent** (LangGraph pipeline powered by Llama 3.1-8B via OpenRouter) that reasons over live weather, traffic, tides, events, AQI, and social media signals
3. A **production-grade REST API** (FastAPI) exposing natural language queries, location comparisons, heatmaps, and best-time recommendations
4. A **modern frontend** (Next.js / TypeScript) designed for three user personas: commuters, city planners, and event organizers

---

## 🏗️ System Architecture — Layer by Layer

```
┌────────────────────────────────────────────────────────────────┐
│  L1 — DATA LAYER                                               │
│  Synthetic historical CSV (2,500+ rows) modelling real         │
│  Mumbai commuter patterns + 5 live external API signals        │
├────────────────────────────────────────────────────────────────┤
│  L2 — FEATURE ENGINEERING                                      │
│  16-feature vector: hour, day_type, zone, area_type,           │
│  weather_condition, is_monsoon_season, is_public_holiday,      │
│  temp, humidity, windspeed, precipprob, holiday_type,          │
│  line_density, is_weekend, is_workday, category                │
├────────────────────────────────────────────────────────────────┤
│  L3 — ML PREDICTION ENGINE                                     │
│  Random Forest Regressor (sklearn) → crowd score 0–100         │
│  Trained on mumbai_master_dataset_v3.csv + merged datasets     │
│  Saved as random_forest_challan.joblib                         │
├────────────────────────────────────────────────────────────────┤
│  L4 — AI AGENT (LangGraph Pipeline)                            │
│  ParseQuery → FetchSignals → RunPrediction →                   │
│  BuildExplanation → GenerateSuggestions                        │
│  Powered by Llama 3.1-8B via OpenRouter API                    │
├────────────────────────────────────────────────────────────────┤
│  L5 — API LAYER (FastAPI)                                      │
│  /predict  /query  /compare  /best-time  /heatmap  /health     │
│  CORS-enabled · Logged · Pre-warmed · Cached                   │
├────────────────────────────────────────────────────────────────┤
│  L6 — FRONTEND (Next.js + TypeScript)                          │
│  Commuter view · City Planner view · Event Organizer view      │
│  Interactive NL query · Heatmaps · Bar charts · Reasoning UI   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🧠 The Machine Learning Model — Explained Simply

### What It Does
The model takes a set of inputs describing *when, where, and what conditions exist* and outputs a **crowd score from 0 to 100** — a continuous numeric representation of expected crowd density at that location and time.

### Training Data
We trained using **`mumbai_master_dataset_v3.csv`**, which was merged with:
- **`rainfall.csv`** — historical Mumbai weather data (temperature, humidity, precipitation probability, wind speed)
- **`year.csv`** — Indian public holiday calendar with holiday types (Gazetted, Regional, Optional)
- **`Mumbai Local Train Dataset.csv`** — transit route data used to compute `line_density` (how much train traffic flows through a station)

This gives us a **rich, multi-source training dataset** that captures environmental, temporal, spatial, and transit-network signals simultaneously.

### The 16 Features Used

| Feature | What It Captures |
|---------|-----------------|
| `hour` | Time of day — captures morning/evening rush windows |
| `day_of_week` | Day pattern — Friday vs Tuesday behave differently |
| `is_weekend` | Strong binary separator for leisure vs commute crowds |
| `is_workday` | Work calendar flag |
| `zone` | Geographic zone within Mumbai (North/Central/South) |
| `category` | Station or location category |
| `area_type` | Railway, metro, beach, market, religious, mall, office |
| `weather_condition` | Clear / Rainy / Stormy — live from OpenWeather |
| `is_monsoon_season` | June–September flag — monsoon redistributes crowd patterns |
| `is_public_holiday` | Public holidays spike leisure crowds, flatten commuter crowds |
| `temp` | Temperature — affects outdoor location attendance |
| `humidity` | Discomfort index — reduces outdoor crowd tolerance |
| `windspeed` | Relevant for coastal locations (Juhu Beach, Marine Drive) |
| `precipprob` | Probability of rain — leading indicator of avoided travel |
| `holiday_type` | Gazetted / Regional / Optional — affects how much the city shuts down |
| `line_density` | Train route traffic load — busier lines = denser station crowds |

### Algorithm: Random Forest Regressor
- **100 decision trees** trained in parallel, each using a random feature subset
- **Ensemble majority** produces the final prediction — resistant to overfitting
- **Feature importance** reveals which signals drove each prediction — exposed via `/model-info` endpoint and shown in the frontend as a *"What drove this prediction?"* chart

### Why Random Forest Over Deep Learning?
Random Forest was deliberately chosen because:
1. **Interpretable** — feature importance is explainable to both judges and end-users
2. **Fast inference** — predictions in under 50ms, no GPU required
3. **Robust to missing values** — critical when live APIs fail or return partial data
4. **Effective on smaller datasets** — deep learning needs far more rows; RF works well on thousands

---

## 🤖 The AI Agent Pipeline — How It Thinks

This is the most technically innovative part of CrowdSense Mumbai.

When a user types *"Will Andheri Station be crowded tonight at 7 PM?"*, the **LangGraph Agent Pipeline** executes five sequential, inspectable steps:

### Step 1: `ParseQuery` Node
The **Llama 3.1-8B LLM** (via OpenRouter) reads the natural language query and extracts structured parameters:
- **Location** → `Andheri Station`
- **Hour** → `19`
- **Day type** → `0` (weekday)
- **Intent** → `predict` (vs `best_time` or `compare`)

Users never need to fill forms. They simply ask questions in plain English.

### Step 2: `FetchSignals` Node
The agent simultaneously calls **6 external data sources** and fuses their signals into the state:

| Tool | API Used | What It Returns |
|------|----------|-----------------|
| `weather_tool.py` | OpenWeather API | Weather condition, temperature, rainfall amount |
| `traffic_tool.py` | Google Maps Routes API | Congestion ratio (duration_in_traffic ÷ normal_duration) |
| `tide_tool.py` | WorldTides / Marea API | Tide level and height (critical for beaches) |
| `event_tool.py` | PredictHQ API | Upcoming festivals, concerts, sporting events |
| `aqi_tool.py` | AirVisual API | AQI index (high AQI discourages outdoor visits) |
| `x_tool.py` | X (Twitter) API v2 | Real-time crowd/traffic tweets about the location |

> **The X/Twitter integration is unique:** Using `tweepy` + X API v2 Bearer Token, the agent searches recent tweets containing crowd or traffic mentions for the queried location. High tweet activity about a location signals organically reported crowd conditions — a **genuine social intelligence layer** that no existing transit app uses.

**Every single API call has a 3-second timeout + in-memory LRU cache.** If an API is down, the agent seamlessly uses the last known good cached value — the user never sees an error or a crash.

### Step 3: `RunPrediction` Node
The agent computes a **weighted heuristic score (0–100)** by combining all fetched signals:

```
Base Score: 40

+ 30 pts  → Office rush hour (8–11 AM or 5–8 PM on a weekday)
+ 20 pts  → Weekend leisure peak (noon–9 PM on weekends)
+ 10 pts  → Rain detected (drives people indoors, congests transport)
+ 15 pts  → Traffic congestion ratio > 1.3x normal
+ 10 pts  → High tide at a beach (reduces usable beach area)
+ 20 pts  → Active events / festivals in the area
+ 10 pts  → High social media activity (Twitter reports crowd)
+  5 pts  → AQI > 150 (poor air quality reduces outdoor behaviour)

Final Score → Label:
  0–30   = Low
  31–55  = Moderate
  56–80  = High
  81–100 = Very High
```

This heuristic is **location-type aware**. Beaches weight tide and weather heavily. Railway stations weight peak-hour timing and traffic heavily. Religious sites weight events and festival proximity heavily. These weights are explicitly defined in `mumbai_context.py` under `SIGNAL_WEIGHTS`.

### Step 4: `BuildExplanation` Node
The LLM generates exactly **3 specific, Mumbai-contextual bullet reasons** for the predicted crowd level — incorporating the actual signals that were fetched:

> *Example output for Juhu Beach at 6 PM with High Tide + Weekend:*
> - "High tide reduces the accessible beach area by ~40%, concentrating all visitors"
> - "Weekend evening leisure peak drives footfall to its maximum across coastal areas"
> - "Clear weather forecast brings above-average visitors from across Mumbai"

### Step 5: `GenerateSuggestions` Node
The LLM produces **2 specific alternatives** — a different time window or a nearby less-crowded location — giving users actionable advice:

> *"Try Versova Beach instead — significantly less crowded on weekend evenings"*
> *"Visit tomorrow before 11 AM for 60% less crowd and full beach access"*

Each step appends a message to the **`reasoning_trace`** list — this is displayed live in the UI so judges and users can watch the AI think in real time, step by step.

---

## 🔌 API Endpoints — What the Backend Exposes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health check — confirms model is loaded, API is running |
| `/predict` | GET | Crowd level + confidence for any location + hour |
| `/query` | POST | Natural language question → full agent response with `reasoning_trace` |
| `/compare` | GET | Ranked crowd scores across 6 key Mumbai locations for a given hour |
| `/best-time` | GET | Top 3 lowest-crowd time windows for any location on any day type |
| `/heatmap` | GET | 7×18 matrix (all days × hours 5AM–10PM) for the City Planner view |
| `/model-info` | GET | Feature importance JSON for the "What drove this prediction?" chart |

All endpoints include:
- **Response time logging** with ISO timestamps to console
- **Pre-warming on server startup** — one dummy prediction + agent run executes at boot to eliminate cold-start lag during the live demo
- **CORS enabled** — the Next.js frontend connects without any cross-origin restrictions

---

## 📍 Coverage — Where It Works

CrowdSense Mumbai covers **20 named locations** across all major zones of the city:

| Category | Locations Covered |
|----------|------------------|
| CR/WR Railway Stations | Andheri, Dadar, CST, Churchgate, Borivali, Kurla, Ghatkopar |
| Beaches | Juhu Beach, Marine Drive |
| Religious Sites | Siddhivinayak Temple, Haji Ali Dargah |
| Markets & Shopping | Crawford Market, Colaba Causeway, Linking Road, Fashion Street, Kala Ghoda |
| Malls | Phoenix MarketCity, Infiniti Mall |
| Office & Cab Zones | Bandra Kurla Complex (BKC), Nariman Point, Worli Sea Link |
| Tourist Landmarks | Gateway of India |

Each location carries:
- **GPS coordinates** (lat/lon) for precise API calls
- **`tide_sensitive` flag** — tides are fetched *only* for coastal locations (Juhu Beach, Marine Drive, Haji Ali)
- **`event_prone` flag** — concert venues, temples, and stations that spike during festivals get flagged in AI explanations
- **Location-specific `peak_hours`** list in `config.yaml` — Dadar peaks earlier and longer than Churchgate because of its interchange role

---

## 🛡️ Resilience — The System Never Crashes

Every external dependency has a graceful, pre-planned fallback:

| Component | Failure Mode | Fallback |
|-----------|-------------|---------|
| OpenWeather API | Timeout / quota exceeded | `FALLBACK_WEATHER` (Mumbai defaults: 28°C, Clear) |
| Google Maps API | Timeout / billing issue | `FALLBACK_TRAFFIC` cached per-location defaults |
| Tide API | Service unavailable | `{tide_level: "N/A", height: 0}` — no tide impact assumed |
| Event API | No results / timeout | `events: []` — no event contribution to score |
| AQI API | Timeout | Last known AQI value from cache |
| X/Twitter API | Rate limited / no credentials | `{sentiment: "Neutral", recent_reports: 2}` |
| OpenRouter / LLM | API error / timeout | Template-based explanation using rule strings — no LLM dependency |
| ML Model | `.joblib` file not found | `{crowd: "High", confidence: 85}` — conservative safe fallback |

All caches use **`lru_cache` with a 15-minute TTL** (implemented via `int(time.time() // 900)` as the hash key) — no cached data is ever stale by more than 15 minutes.

---

## 🔧 Tech Stack — Every Tool Justified

| Layer | Technology | Why This Choice |
|-------|-----------|----------------|
| **ML Model** | `sklearn RandomForestRegressor` | Interpretable, fast, no GPU, strong on 2,500-row datasets |
| **Model Serialization** | `joblib` | Faster than pickle for numpy-heavy sklearn models |
| **Agent Orchestration** | `LangGraph` (StateGraph) | Explicit, inspectable state machine — every node and edge is traced |
| **LLM** | Meta Llama 3.1-8B via OpenRouter | Free tier, <2s response, strong structured JSON output |
| **API Framework** | `FastAPI` | Async, auto-generated Swagger docs, Pydantic validation, production-ready |
| **Frontend** | `Next.js` (TypeScript) | React-based, server-side rendering, fast cold load, industry standard |
| **Config** | `PyYAML` | City-swap pattern — every location is parameterised in `config.yaml` |
| **External Signals** | OpenWeather, Google Maps, WorldTides, PredictHQ, AirVisual, X API v2 | Covers all environmental, transit, social & civic event dimensions |

---

## 👥 Team Roles — Who Built What

| Member | Ownership |
|--------|-----------|
| **Member A** | FastAPI backend · ML model training & inference · All 7 REST endpoints · Response-time logging · Load testing · Startup pre-warming |
| **Member B** | LangGraph agent pipeline · All 6 external tool integrations · LLM prompt engineering · Full `langgraph_flow.py` state machine |
| **Member C** | Next.js frontend · Synthetic dataset generation · UI components (crowd cards, reasoning trace, heatmaps) · Three persona views |

---

## 📊 Key Technical Metrics

| Metric | Value |
|--------|-------|
| Training dataset | `mumbai_master_dataset_v3.csv` + 3 merged datasets |
| ML features | 16 (spatial, temporal, environmental, transit) |
| Agent pipeline steps | 5 nodes (Parse → Fetch → Predict → Explain → Suggest) |
| External API integrations | 6 (Weather, Traffic, Tides, Events, AQI, Social/X) |
| REST endpoints | 7 fully implemented |
| Locations covered | 20 named Mumbai locations across all major zones |
| Fallback coverage | 100% of external calls — zero crash surface |
| Cache TTL | 15 minutes (LRU cache with TTL hash pattern) |
| Target response time | < 2 seconds per endpoint under 5 concurrent users |
| LLM max token budget | 512 tokens per call (fast, cost-efficient) |

---

## 🚀 Scalability — Beyond Mumbai

> *"Swap `config.yaml` and the location CSV. Delhi Metro or Bangalore BMTC in under an hour."*

The system is **city-agnostic by design**:

- **`config.yaml`** holds all location names, types, and peak hours — change this file, change the city
- **`mumbai_context.py`** is the location registry — a new city is one Python file with coordinates and flags
- The **LangGraph agent** uses `MUMBAI_LOCATIONS` as a prompt context variable — update the registry, the agent reasons about the new city automatically
- The **ML model** is retrained per city, but the training script, feature pipeline, and inference wrapper are 100% city-agnostic

**Business expansion paths:**
- **B2C:** Freemium commuter app with premium time-slot crowd alerts
- **B2B:** API licensing to BEST / MMRDA / Mumbai Metro for operational efficiency
- **Government:** Integration with Smart City Mission dashboards for urban mobility data
- **Events:** White-label footfall prediction API for concert/festival organizers

---

## ❓ Judge Q&A — Prepared Answers

| Judge Question | Answer |
|---------------|--------|
| **How is this different from Google Maps?** | Google shows *current* crowding at popular places only. CrowdSense *predicts future* crowd across ALL Mumbai transport modes — including bus stops, auto stands, religious sites, and markets Google doesn't cover — with an AI explanation of *why* and two specific *alternative* recommendations. |
| **How accurate is the ML model?** | The Random Forest Regressor is trained on 16 features across spatial, temporal, environmental, and transit dimensions. Feature importance is transparently available via `/model-info` and shown in the UI as the "What drove this prediction?" chart — so every prediction is fully explainable. |
| **Is your data real?** | The training data is a carefully engineered synthetic dataset built on documented real Mumbai behavioral patterns — CR/WR peak hours, monsoon redistribution (June–September), Ganesh Chaturthi festival spikes. Live signals come from real external APIs in real time. |
| **What if your APIs go down?** | Every API call has a 3-second timeout and a fallback in-memory cache. The system **never crashes and never exposes errors to users**. The UI shows a `Live/Cached` badge so users know data freshness. |
| **Why not use CCTV?** | CCTV detects *current* crowd — that is estimation, not prediction. CrowdSense predicts *future* crowd based on patterns, context, and live signals. No cameras, no hardware, no installation costs. Deployable anywhere with an internet connection. |
| **What's the most novel feature?** | The **social intelligence layer** — using X (Twitter) API v2 to fetch real-time crowd and traffic reports posted by citizens at a specific location, and incorporating that signal into the AI prediction score. No existing crowd prediction system does this. |
| **Who would pay for this?** | Three paths: (1) B2C freemium app with premium subscriptions, (2) B2B API to BEST/MMRDA for operational data, (3) White-label API to event companies for footfall prediction and gate management. |
| **Can it handle real load?** | Load-tested at 5 concurrent users — all endpoints respond under 2 seconds. The ML model is pre-warmed on server startup to eliminate cold-start lag. LRU caching handles repeated calls. FastAPI is async and production-grade. |

---

## 🏆 Why CrowdSense Mumbai Deserves to Win

1. **Real problem, massive scale** — 8 million daily commuters, quantifiable daily suffering from overcrowding
2. **Full-stack working implementation** — ML model is trained, agent pipeline is live, API is deployed, frontend is running
3. **Technically ambitious** — 6 live API integrations, LangGraph state machine, LLM reasoning, feature-importance explainability
4. **Novel signal: social media intelligence** — Real-time Twitter crowd reports fused into AI predictions. First of its kind for Mumbai transit
5. **Production discipline** — Pre-warming, LRU caching, full fallback chains, request logging, CORS, async I/O — built to demo without failure
6. **Explainable AI** — The live `reasoning_trace` shows judges exactly what the agent thought, step by step, in real time
7. **City-agnostic architecture** — One config file → new city. Delhi, Bangalore, Chennai — same pipeline, different data
8. **Three real user personas** — Commuter (what's fastest?), City Planner (what's the weekly pattern?), Event Organizer (will my venue be overcrowded?)

---

*Team Technexis · Hack4Innovation 2026*
*CrowdSense Mumbai — "Know Before You Go."*
