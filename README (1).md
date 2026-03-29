# CrowdSense Mumbai
> *Predict the crowd. Beat the rush.*

**AI-powered crowd density prediction for Mumbai's public transport and public spaces.**

---

## Problem Statement

Every day, 8 million people take Mumbai's local trains. 40% arrive at the wrong time and stand in a crowd they could have avoided. Current tools (like Google Maps) show **current** crowding — CrowdSense predicts **future** crowd levels with explanations.

> *"Google tells you a place is crowded right now — CrowdSense tells you which place, which route, and which time will be least crowded an hour from now, across every transport mode in the city, with an explanation of why."*

---

## Team

| Member | Role |
|--------|------|
| Member A | Backend — FastAPI + ML Model |
| Member B | Backend — LangChain + LangGraph Agent |
| Member C | Frontend — Streamlit UI + Data Pipeline |

---

## Tech Stack

`Python` · `FastAPI` · `LangGraph` · `Random Forest (sklearn)` · `Streamlit` · `OpenWeather API` · `Google Maps API` · `Groq LLM (llama-3.1-8b-instant)`

---

## Coverage

| Transport Modes | Railway Stations | Public Places | Signal Sources |
|----------------|-----------------|---------------|----------------|
| Local trains (CR/WR) | Andheri, Dadar, CST | Siddhivinayak temple | OpenWeather API |
| Mumbai Metro (L1,2,2A) | Bandra, Kurla, Borivali | Haji Ali Dargah | Google Maps Traffic |
| BEST buses + depots | Ghatkopar, Versova | Juhu + Marine Drive beach | Synthetic CSV (2500 rows) |
| Auto / Cab zones | Kurla, CST interchange | Phoenix mall, Linking Rd | Simulation toggles |
| — | — | Crawford + Mahim market | Mumbai event calendar |

---

## System Architecture

```
L1 — Data       Synthetic CSV + APIs        Historical patterns + live weather/traffic
L2 — Features   Feature Builder module      Encode hour, day_type, weather, traffic, events
L3 — Prediction Random Forest (sklearn)     Output: Low / Medium / High / Very High + confidence %
L4 — Agent      LangGraph pipeline          Parse query → fetch signals → predict → explain → suggest
L5 — API        FastAPI                     REST endpoints: /predict, /query, /compare, /best-time
L6 — UI         Streamlit                   Three persona views: Commuter, City Planner, Event Organizer
```

---

## Folder Structure

```
crowd_sense_mumbai/
├── backend/
│   ├── data/
│   │   └── mumbai_crowd.csv          ← 2500-row synthetic dataset
│   ├── model/
│   │   ├── train.py                  ← RandomForest training script
│   │   ├── predict.py                ← inference + confidence
│   │   └── crowd_model.pkl           ← saved model artifact
│   ├── agents/
│   │   └── langgraph_flow.py         ← full agent pipeline
│   ├── tools/
│   │   ├── weather_tool.py           ← OpenWeather + fallback cache
│   │   ├── traffic_tool.py           ← Google Maps + fallback cache
│   │   └── mumbai_context.py         ← location registry + signal weights
│   ├── api/
│   │   └── routes.py                 ← all FastAPI route definitions
│   └── main.py                       ← FastAPI app entry point
├── frontend/
│   ├── app.py                        ← Streamlit main app
│   ├── views/
│   │   ├── commuter.py
│   │   ├── planner.py
│   │   └── organizer.py
│   └── components/
│       ├── crowd_card.py
│       └── reasoning_trace.py
├── config.yaml                       ← city config (swap for other cities)
└── requirements.txt
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict` | GET | Crowd level + confidence for location + hour |
| `/query` | POST | Natural language query → full agent response with reasoning trace |
| `/compare` | GET | Ranked crowd levels across all locations for a given hour |
| `/best-time` | GET | Top 3 lowest-crowd time windows for a location + day type |
| `/heatmap` | GET | 7×18 matrix of crowd levels for city planner weekly view |
| `/health` | GET | System health check — API status, model loaded, fallback cache status |

---

## ML Model

- **Algorithm:** `RandomForestClassifier` (sklearn)
- **Training data:** 2500-row synthetic CSV based on real Mumbai behavioral patterns
- **Features:** `hour`, `day_type`, `location_type_enc`, `weather_code`, `traffic_level`, `is_event`, `month`, `is_peak_hour`
- **Output:** `Low / Medium / High / Very High` + confidence % from `predict_proba()`
- **Expected accuracy:** ~82% on held-out test set

---

## LangGraph Agent Pipeline

```
ParseQuery → FetchSignals → RunPrediction → BuildExplanation → GenerateSuggestions
```

Each node appends a step to `reasoning_trace`, displayed live in the UI.

---

## Fallback & Resilience

All external API calls use a 3-second timeout with last-known-good in-memory cache. The system **never crashes or exposes errors** to the user.

- **OpenWeather fallback:** last successful call cached per city
- **Google Maps fallback:** last traffic level cached per location
- **LLM fallback:** template-based explanation using rule strings
- **Model fallback:** rule-based scoring from `SIGNAL_WEIGHTS` dict

---

## Setup

### Pre-requisites

```bash
pip install fastapi uvicorn scikit-learn joblib pandas numpy \
  langchain langchain-groq langgraph streamlit plotly \
  requests python-dotenv pyyaml matplotlib
```

### Environment Variables

Create a `.env` file in the project root:

```
OPENWEATHER_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### Run

```bash
# Start backend
cd backend
uvicorn main:app --reload --port 8000

# Start frontend (separate terminal)
cd frontend
streamlit run app.py
```

---

## Integration Checkpoints

| Time | Checkpoint | Member A | Member B | Member C |
|------|-----------|----------|----------|----------|
| Hr 3 | CP-1: Skeleton | `/health` + `/predict` dummy | weather + traffic tools tested | CSV generated, Streamlit shell running |
| Hr 8 | CP-2: Model live | `/predict` returns real ML output | All LLM nodes tested individually | Commuter tab wired to live `/predict` |
| Hr 14 | CP-3: Agent live | All 5 endpoints working | `/query` end-to-end with trace | NL query + reasoning trace visible |

---

## Scalability

> *"Swap `config.yaml` and the location CSV. Delhi Metro or Bangalore BMTC in under an hour. The agent context is the only thing that needs updating."*

---

## Requirements.txt

```
fastapi==0.111.0
uvicorn==0.29.0
scikit-learn==1.4.2
joblib==1.4.0
pandas==2.2.2
numpy==1.26.4
langchain==0.2.0
langchain-groq==0.1.3
langgraph==0.1.0
streamlit==1.35.0
plotly==5.21.0
requests==2.31.0
python-dotenv==1.0.1
pyyaml==6.0.1
matplotlib==3.8.4
```
