# CrowdSense Mumbai - Project Writeup

> **Predict the crowd. Beat the rush.**
> 
> AI-powered crowd density prediction for Mumbai's public transport and public spaces.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [System Architecture](#system-architecture)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [Backend Details](#backend-details)
8. [Frontend Details](#frontend-details)
9. [Machine Learning Model](#machine-learning-model)
10. [AI Agent Pipeline](#ai-agent-pipeline)
11. [API Endpoints](#api-endpoints)
12. [External Integrations](#external-integrations)
13. [Database Schema](#database-schema)
14. [Deployment Configuration](#deployment-configuration)
15. [Team Structure](#team-structure)
16. [Resilience & Fallbacks](#resilience--fallbacks)
17. [Scalability](#scalability)
18. [Environment Variables](#environment-variables)
19. [Setup Instructions](#setup-instructions)
20. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**CrowdSense Mumbai** is a full-stack AI platform that predicts crowd levels across 20+ key locations in Mumbai using machine learning and multi-signal AI agents. The platform serves three user personas: commuters seeking to avoid crowds, city planners analyzing patterns, and event organizers planning venues.

**Key Metrics:**
- **14M+** daily commuters in Mumbai coverage area
- **20+** monitored locations (railway stations, beaches, temples, markets, malls)
- **6** live external signal sources
- **90%+** prediction accuracy target
- **<2s** API response time

---

## Problem Statement

Mumbai faces severe overcrowding challenges:

- **8 million+ commuters** ride Mumbai local trains daily (Central Railway + Western Railway)
- **40% arrive at the wrong time**, experiencing severe overcrowding they could have avoided
- Current tools (Google Maps, Apple Maps) only show **current** crowding, not **future** predictions
- No predictive intelligence exists for bus stops, auto stands, religious sites, and markets

**The Gap:** People have no way to *predict* future crowd levels — only react to them in the moment.

---

## Solution Overview

CrowdSense Mumbai combines four core technologies:

1. **Machine Learning Model** - Random Forest Regressor trained on synthetic Mumbai behavioral data
2. **Multi-Signal AI Agent** - LangGraph pipeline powered by Llama 3.1-8B via OpenRouter
3. **Production REST API** - FastAPI with 7+ endpoints, CORS-enabled, pre-warmed
4. **Modern Frontend** - Next.js/TypeScript with three persona-specific views

**Differentiation from Google Maps:**
- Google shows *current* crowding at popular places only
- CrowdSense *predicts future* crowd across ALL transport modes
- Includes AI explanations of *why* and specific *alternative* recommendations

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  L1 — DATA LAYER                                               │
│  Synthetic historical CSV (2,500+ rows) + 6 live API signals   │
├────────────────────────────────────────────────────────────────┤
│  L2 — FEATURE ENGINEERING                                      │
│  16-feature vector: hour, day_type, zone, weather, traffic, etc. │
├────────────────────────────────────────────────────────────────┤
│  L3 — ML PREDICTION ENGINE                                     │
│  Random Forest Regressor → crowd score 0–100                     │
├────────────────────────────────────────────────────────────────┤
│  L4 — AI AGENT (LangGraph Pipeline)                            │
│  ParseQuery → FetchSignals → RunPrediction → Explain → Suggest  │
├────────────────────────────────────────────────────────────────┤
│  L5 — API LAYER (FastAPI)                                      │
│  /predict, /query, /compare, /best-time, /heatmap, /health    │
│  CORS-enabled · Logged · Pre-warmed · Cached                   │
├────────────────────────────────────────────────────────────────┤
│  L6 — FRONTEND (Next.js + TypeScript)                          │
│  Commuter view · Planner view · Event Organizer view           │
│  Interactive NL query · Heatmaps · Reasoning UI                │
└────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **ML Model** | `sklearn RandomForestRegressor` | Interpretable, fast, no GPU needed, effective on smaller datasets |
| **Model Serialization** | `joblib` | Faster than pickle for numpy-heavy sklearn models |
| **Agent Orchestration** | `LangGraph` (StateGraph) | Explicit, inspectable state machine with full traceability |
| **LLM** | Meta Llama 3.1-8B via OpenRouter | Free tier, <2s response, strong structured JSON output |
| **API Framework** | `FastAPI` | Async, auto-generated Swagger docs, Pydantic validation |
| **Frontend** | `Next.js 16.2.1` (TypeScript) | React-based, SSR, fast cold load, industry standard |
| **Database** | `Supabase` (PostgreSQL) | Real-time subscriptions, Row Level Security, vector store |
| **Styling** | `Tailwind CSS 4` | Utility-first, modern design system |
| **Maps** | `Google Maps JavaScript API` | Live traffic visualization |
| **Config** | `PyYAML` | City-swap pattern — parameterized locations |

**Python Dependencies:**
```
fastapi==0.109.2
uvicorn==0.27.1
scikit-learn==1.4.1.post1
joblib==1.3.2
pandas==2.2.0
numpy==1.26.4
langchain==0.1.9
langgraph==0.0.26
openai==1.12.0
supabase==2.3.7
websockets==12.0
tweepy==4.14.0
```

**Node.js Dependencies:**
```
next==16.2.1
react==19.2.4
@supabase/supabase-js==2.100.1
@vis.gl/react-google-maps==1.8.1
tailwindcss==4
```

---

## Project Structure

```
CROWDSENSE-AI/
├── backend/
│   ├── agents/
│   │   └── langgraph_flow.py          # Full LangGraph agent pipeline
│   ├── api/
│   │   └── routes.py                  # All FastAPI route definitions
│   ├── database/
│   │   └── models.py                  # Supabase database models
│   ├── model/
│   │   ├── train_model.py             # ML training script
│   │   ├── inference.py               # Model inference wrapper
│   │   ├── cascade_engine.py          # Network cascade propagation
│   │   ├── crowd_model.pkl            # Saved model artifact
│   │   └── encoders.joblib            # Label encoders
│   ├── tools/
│   │   ├── weather_tool.py            # OpenWeather API integration
│   │   ├── traffic_tool.py            # Google Maps/TomTom traffic
│   │   ├── tide_tool.py               # WorldTides API for beaches
│   │   ├── event_tool.py              # PredictHQ events API
│   │   ├── aqi_tool.py                # AirVisual AQI API
│   │   ├── x_tool.py                  # X/Twitter API v2
│   │   └── mumbai_context.py          # Location registry + weights
│   ├── main.py                        # FastAPI app entry point
│   ├── config.yaml                    # Location metadata & peak hours
│   ├── requirements.txt               # Python dependencies
│   └── tests/                         # Backend test suite
├── frontend/
│   ├── app/
│   │   ├── page.tsx                   # Landing page
│   │   ├── layout.tsx                 # Root layout
│   │   ├── globals.css                # Global styles
│   │   ├── dashboard/                 # Dashboard view
│   │   ├── commuter/                  # Commuter AI view
│   │   ├── analytics/                 # City planner analytics
│   │   ├── alerts/                    # Live alerts page
│   │   ├── map/                       # Live map view
│   │   ├── login/                     # Authentication
│   │   ├── signup/                    # User registration
│   │   ├── components/                # Reusable UI components
│   │   └── lib/                       # Utility libraries
│   │       ├── supabaseClient.ts      # Supabase client
│   │       └── api.ts                 # API client
│   ├── package.json                   # Node dependencies
│   ├── next.config.ts                 # Next.js configuration
│   ├── tsconfig.json                  # TypeScript config
│   └── tailwind.config                # Tailwind CSS config
├── docs/
│   ├── crowdsense_mumbai_project_explanation.md
│   ├── user_flow.md
│   └── dataset_inventory.md
├── supabase_setup.sql                 # Database schema
├── render.yaml                        # Render deployment config
├── DEPLOYMENT.md                      # Deployment guide
├── member_a_plan.md                   # Backend developer plan
├── member_b_plan.md                   # Agent developer plan
├── member_c_plan.md                   # Frontend developer plan
├── README.md                          # Project README
└── .env                               # Environment variables (not committed)
```

---

## Backend Details

### FastAPI Application (`main.py`)

**Core Features:**
- **CORS Middleware** - Allow all origins for frontend communication
- **Request Logging** - All API calls logged with timestamps and response times
- **API Key Security** - Enterprise key validation for B2B endpoints
- **Model Pre-warming** - Dummy prediction on startup to eliminate cold-start lag
- **WebSocket Support** - Real-time crowd stream at `/ws/live`

**Startup Sequence:**
```python
@app.on_event("startup")
async def startup_event():
    # Pre-warm LangChain/LLM agent
    run_agent("pre-warm cold start dummy query")
    # Pre-warm ML model
    crowd_model.predict(dummy_features)
```

### API Router (`api/routes.py`)

**Implemented Endpoints:**

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | System health check |
| `/predict` | GET | No | Basic crowd prediction |
| `/query` | POST | Yes | Full agent pipeline with reasoning |
| `/predict/stream` | POST | Yes | SSE streaming reasoning trace |
| `/compare` | GET | No | Ranked crowd scores all locations |
| `/best-time` | GET | No | Top 3 lowest-crowd windows |
| `/heatmap` | GET | No | 7×18 matrix for weekly view |
| `/model-info` | GET | No | Feature importance JSON |
| `/report` | POST | No | Submit live crowd report (HITL) |
| `/report-ai` | POST | No | Parse unstructured text to alert |
| `/pulse` | GET | No | Network-wide health score |
| `/safety-score` | GET | No | Composite safety grade (A+-F) |
| `/cascade` | GET | No | Cascade propagation from origin |
| `/cascade-all` | GET | No | City-wide cascade view |

### Configuration (`config.yaml`)

**20 Monitored Locations:**

| Category | Locations |
|----------|-----------|
| Railway Stations | Andheri, Dadar, CST, Churchgate, Borivali, Kurla, Ghatkopar |
| Beaches | Juhu Beach, Marine Drive |
| Religious Sites | Siddhivinayak Temple, Haji Ali Dargah |
| Markets | Crawford Market, Colaba Causeway, Linking Road, Fashion Street, Kala Ghoda |
| Malls | Phoenix MarketCity, Infiniti Mall |
| Transit Hubs | Bandra West, Worli Sea Link |
| Tourist | Gateway of India |

Each location has:
- `type`: railway, beach, religious, market, mall, cab_zone, tourist
- `peak_hours`: Array of high-traffic hours
- `tide_sensitive`: Boolean (for coastal locations)
- `event_prone`: Boolean (for venues that spike during festivals)
- GPS coordinates (lat/lon)

---

## Frontend Details

### Next.js Application Structure

**Pages:**
- `/` - Landing page with hero, stats, live station feed
- `/dashboard` - Main user dashboard
- `/commuter` - AI-powered commuter assistant
- `/analytics` - City planner analytics and heatmaps
- `/alerts` - Live crowd alerts and ticker
- `/map` - Interactive map with crowd overlays
- `/login` - User authentication
- `/signup` - User registration

**Key Components:**
- Live ticker with rotating alerts
- Station cards with crowd indicators (LOW/MED/HIGH/CRIT)
- Feature importance bars
- Interactive heatmap visualization
- Natural language query input
- Real-time reasoning trace display

**Styling System:**
- CSS variables for colors and spacing
- Brutalist design aesthetic
- Responsive breakpoints for mobile
- Animation classes for fade-up effects

---

## Machine Learning Model

### Algorithm: Random Forest Regressor

**Why Random Forest:**
1. **Interpretable** - Feature importance is explainable
2. **Fast inference** - Predictions in <50ms, no GPU required
3. **Robust to missing values** - Critical when live APIs fail
4. **Effective on smaller datasets** - Works well on thousands of rows

### 16 Input Features

| Feature | Type | Description |
|---------|------|-------------|
| `hour` | int | Time of day (0-23) |
| `day_of_week` | int | Day pattern (0-6) |
| `is_weekend` | binary | Weekend flag |
| `is_workday` | binary | Work calendar flag |
| `zone` | encoded | Geographic zone (North/Central/South) |
| `category` | encoded | Location category |
| `area_type` | encoded | Railway, metro, beach, market, etc. |
| `weather_condition` | encoded | Clear / Rainy / Stormy |
| `is_monsoon_season` | binary | June-September flag |
| `is_public_holiday` | binary | Holiday flag |
| `temp` | float | Temperature (Celsius) |
| `humidity` | float | Humidity percentage |
| `windspeed` | float | Wind speed (km/h) |
| `precipprob` | float | Rain probability |
| `holiday_type` | encoded | Gazetted/Regional/Optional |
| `line_density` | float | Train route traffic load |

### Output
- **Crowd Score**: 0-100 continuous value
- **Classification**: Low (0-30) / Moderate (31-55) / High (56-80) / Very High (81-100)

### Training Data Sources

1. **mumbai_master_dataset_v3.csv** - Core dataset with crowd scores
2. **rainfall.csv** - Historical weather (temp, humidity, precipitation)
3. **year.csv** - Indian public holiday calendar
4. **Mumbai Local Train Dataset.csv** - Transit route data for line_density

---

## AI Agent Pipeline

### LangGraph State Machine

**AgentState TypedDict:**
```python
class AgentState(TypedDict):
    query: str
    location: Optional[str]
    hour: Optional[int]
    day_type: Optional[int]
    intent: str
    weather: Optional[dict]
    traffic: Optional[dict]
    tides: Optional[dict]
    events: Optional[List[dict]]
    aqi: Optional[dict]
    social_signals: Optional[dict]
    live_reports: Optional[List[dict]]
    prediction: Optional[str]
    confidence: Optional[float]
    reasons: Optional[List[str]]
    suggestions: Optional[List[str]]
    reasoning_trace: List[str]
```

### Pipeline Nodes

1. **ParseQuery** - LLM extracts location, hour, day_type, intent from natural language
2. **FetchSignals** - Parallel API calls to 6 external data sources
3. **RunPrediction** - ML model inference with HITL override capability
4. **BuildExplanation** - LLM generates 3 contextual reasons
5. **GenerateSuggestions** - LLM produces 2 actionable alternatives
6. **EventMitigation** - Conditional node for major events

### Conditional Routing
```python
def should_mitigate_event(state: AgentState):
    events = state.get("events")
    if events and len(events) > 0:
        return "event_mitigation"
    return "generate_suggestions"
```

---

## API Endpoints

### Core Endpoints

#### GET /health
```json
{
  "status": "ok"
}
```

#### GET /predict
Parameters: `location`, `hour`
```json
{
  "crowd": "High",
  "confidence": 85
}
```

#### POST /query
Request:
```json
{
  "query": "Will Andheri be crowded at 7 PM tonight?"
}
```
Response:
```json
{
  "location": "Andheri Station",
  "hour": 19,
  "prediction": "Very High",
  "confidence": 0.92,
  "reasons": [
    "Evening office rush — peak exit window",
    "Traffic congestion 60% above normal",
    "7 recent tweets reporting packed trains"
  ],
  "suggestions": [
    "Travel after 9 PM for 55% less crowd",
    "Use Jogeshwari Station instead"
  ],
  "reasoning_trace": [
    "🔍 Initializing agent: Parsing natural language query...",
    "📍 Location detected: 'Andheri Station' · Intent: 'predict'",
    "📡 API handshake: Syncing live data...",
    "✅ Signal integration component: Success.",
    "🤖 Model ExecutionNode: Initializing Random Forest inference..."
  ]
}
```

#### GET /compare
Parameters: `hour`
Returns ranked list of all locations by crowd score.

#### GET /best-time
Parameters: `location`, `day_type`
Returns top 3 lowest-crowd time windows.

#### GET /heatmap
Parameters: `location`
Returns 7×18 matrix (days × hours 5AM-10PM).

#### GET /pulse
Returns network-wide health metrics:
```json
{
  "pulse": 68,
  "status": "Moderate Congestion",
  "color": "#F59E0B",
  "advice": "Expect delays on Western Line",
  "critical_zone_count": 3,
  "top_crowded": [...],
  "most_clear": [...]
}
```

#### GET /cascade
Parameters: `origin`, `score`, `hour`
Predicts downstream station impacts from crowd surges.

---

## External Integrations

### 1. OpenWeather API
- **Purpose**: Current weather conditions
- **Fallback**: Mumbai defaults (28°C, Clear)
- **Timeout**: 3 seconds

### 2. Google Maps Routes API / TomTom
- **Purpose**: Traffic congestion ratios
- **Metric**: `duration_in_traffic / duration`
- **Fallback**: Per-location cached defaults

### 3. WorldTides API / Storm Glass
- **Purpose**: Tide levels for coastal locations
- **Used for**: Juhu Beach, Marine Drive, Haji Ali
- **Fallback**: `{tide_level: "N/A", height: 0}`

### 4. PredictHQ API
- **Purpose**: Local festivals, concerts, sporting events
- **Fallback**: Empty events list

### 5. AirVisual / WAQI API
- **Purpose**: Air Quality Index
- **Fallback**: Last known AQI from cache

### 6. X (Twitter) API v2
- **Purpose**: Real-time crowd/traffic mentions
- **Unique feature**: Social intelligence layer
- **Fallback**: `{sentiment: "Neutral", recent_reports: 2}`

### 7. OpenRouter API
- **Purpose**: LLM inference (Llama 3.1-8B)
- **Fallback**: Template-based explanations

---

## Database Schema

### Supabase Tables

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### live_stations
```sql
CREATE TABLE live_stations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    line VARCHAR(100) NOT NULL,
    lineColor VARCHAR(50) NOT NULL,
    crowd VARCHAR(50) NOT NULL,
    count INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### ticker_alerts
```sql
CREATE TABLE ticker_alerts (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### live_reports (HITL)
- Stores crowdsourced ground truth reports
- Supports image uploads to Supabase Storage
- Real-time subscriptions for instant updates

---

## Deployment Configuration

### Render (Backend)

**render.yaml:**
```yaml
services:
  - type: web
    name: crowdsense-backend
    env: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
      - key: SUPABASE_KEY
      - key: OPENROUTER_API_KEY
      - key: CROWDSENSE_ENTERPRISE_KEY_2026
      - key: WORLD_TIDES_API_KEY
      - key: OPENWEATHER_API_KEY
      - key: AIRVISUAL_API_KEY
      - key: PREDICT_HQ_API_KEY
      - key: TOMTOM_API_KEY
      - key: X_BEARER_TOKEN
      - key: PYTHON_VERSION
        value: 3.10.0
```

### Vercel (Frontend)

**Build Settings:**
- Root Directory: `frontend`
- Framework: Next.js

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Backend URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## Team Structure

| Member | Role | Ownership |
|--------|------|-----------|
| **Member A** | Backend Lead | FastAPI, ML model training, all REST endpoints, response-time logging, load testing, startup pre-warming |
| **Member B** | AI/Agent Lead | LangGraph pipeline, 6 external tool integrations, LLM prompt engineering, reasoning trace |
| **Member C** | Frontend Lead | Next.js UI, Supabase real-time, three persona views, heatmaps, reasoning trace visualization |

---

## Resilience & Fallbacks

### Complete Fallback Coverage

| Component | Failure Mode | Fallback Behavior |
|-----------|-------------|-------------------|
| OpenWeather API | Timeout/quota | `FALLBACK_WEATHER` (28°C, Clear) |
| Google Maps API | Timeout/billing | Cached per-location traffic defaults |
| Tide API | Service down | No tide impact assumed |
| Event API | No results | Empty events list |
| AQI API | Timeout | Last known AQI from cache |
| X/Twitter API | Rate limited | Neutral sentiment, 2 reports |
| OpenRouter LLM | API error | Template-based explanations |
| ML Model | File not found | Conservative "High" prediction |
| Supabase | Connection error | Fallback to local data arrays |

### Cache Strategy
- **LRU Cache** with 15-minute TTL
- `int(time.time() // 900)` as hash key
- No data older than 15 minutes

---

## Scalability

### City-Agnostic Architecture

> "Swap `config.yaml` and the location CSV. Delhi Metro or Bangalore BMTC in under an hour."

**What Changes:**
- `config.yaml` - Location names, types, peak hours
- Location registry in `mumbai_context.py`
- ML model retraining on new city data

**What Stays the Same:**
- Training script
- Feature pipeline
- Inference wrapper
- API endpoints
- Frontend components

### Business Expansion Paths
1. **B2C**: Freemium commuter app with premium alerts
2. **B2B**: API licensing to BEST/MMRDA/Mumbai Metro
3. **Government**: Smart City Mission dashboard integration
4. **Events**: White-label footfall prediction for organizers

---

## Environment Variables

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
CROWDSENSE_ENTERPRISE_KEY_2026=your_api_key
WORLD_TIDES_API_KEY=your_tide_key
OPENWEATHER_API_KEY=your_weather_key
AIRVISUAL_API_KEY=your_aqi_key
PREDICT_HQ_API_KEY=your_events_key
TOMTOM_API_KEY=your_traffic_key
X_BEARER_TOKEN=your_x_token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Create .env file with required keys
python main.py
# API runs at http://localhost:8000
```

### Frontend Setup
```bash
cd frontend
npm install
# Ensure .env.local is configured
npm run dev
# App runs at http://localhost:3000
```

### Database Setup
1. Create Supabase project
2. Run `supabase_setup.sql` in SQL Editor
3. Enable Realtime for `ticker_alerts` and `live_stations`

---

## Future Roadmap

### Phase 2 Features
- [ ] Mobile app (React Native)
- [ ] Push notifications for crowd alerts
- [ ] Historical trend analysis
- [ ] Route optimization with crowd avoidance
- [ ] Integration with Mumbai Metro app

### Phase 3 Expansion
- [ ] Delhi Metro coverage
- [ ] Bangalore BMTC coverage
- [ ] Chennai MRTS coverage
- [ ] International: Singapore MRT, London Tube

### Enterprise Features
- [ ] Custom API rate limits per client
- [ ] White-label dashboard
- [ ] Predictive maintenance for transit operators
- [ ] Integration with smart traffic signals

---

## Judge Q&A Prepared Answers

**How is this different from Google Maps?**
> Google shows *current* crowding at popular places only. CrowdSense *predicts future* crowd across ALL Mumbai transport modes — including bus stops, auto stands, religious sites, and markets Google doesn't cover — with an AI explanation of *why* and two specific *alternative* recommendations.

**How accurate is the ML model?**
> The Random Forest Regressor is trained on 16 features across spatial, temporal, environmental, and transit dimensions. Feature importance is transparently available via `/model-info` — so every prediction is fully explainable.

**What if your APIs go down?**
> Every API call has a 3-second timeout and a fallback in-memory cache. The system **never crashes and never exposes errors to users**. The UI shows a `Live/Cached` badge so users know data freshness.

**Why not use CCTV?**
> CCTV detects *current* crowd — that is estimation, not prediction. CrowdSense predicts *future* crowd based on patterns, context, and live signals. No cameras, no hardware, no installation costs. Deployable anywhere with an internet connection.

**What's the most novel feature?**
> The **social intelligence layer** — using X (Twitter) API v2 to fetch real-time crowd and traffic reports posted by citizens at specific locations, and incorporating that signal into the AI prediction score. No existing crowd prediction system does this.

---

*Team Technexis · Hack4Innovation 2026*
*CrowdSense Mumbai — "Know Before You Go."*
