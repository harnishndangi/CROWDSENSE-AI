# CrowdSense Mumbai — User Flow
> *"Know Before You Go."*

---

## The Three Users

| Persona | Goal |
|---------|------|
| 🧑‍💼 **Commuter** — Riya | Avoid peak crowd on her way home from work |
| 🏙️ **City Planner** — Mr. Desai | Identify which stations are overcrowded on weekday evenings |
| 🎪 **Event Organizer** — Priya | Predict footfall at her event venue before booking it |

---

## Persona 1 — Riya the Commuter

**Situation:** It's 5:30 PM on a weekday. Riya is in Bandra and wants to catch a train from Andheri Station, but she's not sure how crowded it'll be.

### Step-by-Step Flow

```
1. Riya opens CrowdSense Mumbai on her phone (Next.js web app)
        │
        ▼
2. She sees the Commuter tab — already pre-loaded with
   Location: Andheri Station | Hour: 18:00 | Day: Weekday
        │
        ▼
3. She types in the NL Query box:
   "Will Andheri Station be very crowded at 6 PM today?"
        │
        ▼
4. Her query hits POST /query → LangGraph Agent starts
        │
   ┌────┴──────────────────────────────────────────┐
   │  AGENT PIPELINE (visible as Reasoning Trace)  │
   │                                               │
   │  Step 1 → ParseQuery                          │
   │    LLM extracts: location=Andheri Station,    │
   │    hour=18, day_type=0 (weekday), intent=predict│
   │                                               │
   │  Step 2 → FetchSignals                        │
   │    Weather API  → Clear, 31°C                 │
   │    Traffic API  → Congestion ratio 1.6x       │
   │    AQI API      → 95 (Moderate)               │
   │    Events API   → No events today             │
   │    Tides API    → N/A (not a beach)           │
   │    X/Twitter    → 7 recent tweets about crowd │
   │                                               │
   │  Step 3 → RunPrediction                       │
   │    Base: 40                                   │
   │    + 30 (evening weekday rush)                │
   │    + 15 (heavy traffic 1.6x)                  │
   │    + 10 (high social reports)                 │
   │    = Score: 95 → "Very High"                  │
   │                                               │
   │  Step 4 → BuildExplanation                    │
   │    • Evening office rush — peak exit window   │
   │    • Traffic congestion 60% above normal      │
   │    • 7 recent tweets reporting packed trains  │
   │                                               │
   │  Step 5 → GenerateSuggestions                 │
   │    Alt 1: Travel after 9 PM — 55% less crowd  │
   │    Alt 2: Use Jogeshwari Station instead       │
   └────────────────────────────────────────────────┘
        │
        ▼
5. Riya sees on screen:
   🔴 Very High  |  Confidence: 85%
   ─────────────────────────────────
   Why:
   • Evening office rush — peak exit window
   • Traffic congestion 60% above normal
   • 7 recent tweets reporting packed trains

   💡 Suggestions:
   → Travel after 9 PM for 55% less crowd
   → Use Jogeshwari Station instead

6. Riya decides to leave at 9 PM. Problem solved.
```

---

## Persona 2 — Mr. Desai the City Planner

**Situation:** Mr. Desai needs to identify which major stations are most overcrowded at 6 PM weekday evenings — to pitch for additional BEST bus routes.

### Step-by-Step Flow

```
1. Mr. Desai opens the City Planner tab
        │
        ▼
2. He clicks "Compare All Stations at 6 PM"
   → Calls GET /compare?hour=18
        │
        ▼
3. API returns ranked crowd scores for all locations:

   Location            Crowd Score
   ──────────────────────────────
   Andheri Station         95  🔴
   Dadar Station           88  🔴
   CST                     82  🔴
   Borivali Station        71  🟠
   Ghatkopar Station       64  🟠
   Juhu Beach              43  🟡
        │
        ▼
4. Mr. Desai also opens the Weekly Heatmap
   → Calls GET /heatmap?location=Dadar Station
   → Sees 7×18 grid (Mon–Sun × 5AM–10PM)
   → Immediately spots: Tue–Thu evenings are
     consistently the worst (dark red cells)
        │
        ▼
5. He checks Feature Importance via /model-info
   → Sees: hour (35%) and is_weekend (22%)
     are the top two prediction drivers for Dadar
        │
        ▼
6. He exports findings and builds his pitch.
```

---

## Persona 3 — Priya the Event Organizer

**Situation:** Priya wants to host a product launch at a venue near Siddhivinayak Temple on a Saturday at 7 PM. She wants to know if the area will already be too crowded.

### Step-by-Step Flow

```
1. Priya opens the Event Organizer tab
        │
        ▼
2. She fills in:
   Venue: Siddhivinayak Temple area
   Date/Time: Saturday, 7 PM
   Expected Capacity: 500 people
        │
        ▼
3. App auto-constructs a query:
   "I am hosting an event at Siddhivinayak Temple
    on Saturday at 7 PM. What crowd should I expect?"
   → Calls POST /query
        │
        ▼
4. Agent pipeline runs (same 5-step flow):
   • Detects: religious site, event_prone = True
   • Fetches: weekend evening + temple crowd patterns
   • Score: 78 → "High"
   • Explanation:
     • Saturday evening puja hours drive baseline crowd
     • Religious site has high event sensitivity weight
     • No major festival today — moderate uplift only
   • Suggestions:
     → Shift to Sunday 11 AM — 40% lower base crowd
     → Consider Worli venue — much lower religious traffic
        │
        ▼
5. Priya gets a gate recommendation:
   "High crowd expected in surrounding area.
    Plan for queue management and additional
    entry gates. Avoid 6–8 PM arrival window."

6. Priya changes the event to Sunday 11 AM.
```

---

## Full Technical Flow — One Page Summary

```
USER INPUT (NL Text / Form / Toggle)
        │
        ▼
Next.js Frontend
  → POST /query  or  GET /predict, /compare, /best-time, /heatmap
        │
        ▼
FastAPI Backend (main.py → api/routes.py)
  → Logs request with timestamp
  → Routes to correct handler
        │
        ├──── Simple predict/compare/heatmap ──────────────────┐
        │     Uses ML Model (random_forest_challan.joblib)     │
        │     Returns crowd score 0–100 instantly (<50ms)      │
        │                                                      │
        └──── /query (NL) ─────────────────────────────────────┤
              Calls run_agent(query)                           │
              LangGraph StateGraph executes:                   │
              ParseQuery → FetchSignals → RunPrediction        │
              → BuildExplanation → GenerateSuggestions         │
              Returns full state with reasoning_trace[]        │
                                                              │
                ◄─────────────────────────────────────────────┘
        │
        ▼
Frontend renders:
  • Crowd label + confidence badge
  • 3 bullet reasons
  • 2 specific suggestions
  • Live reasoning trace (step by step)
  • Live / Cached badge
  • Charts: trend line, heatmap, feature importance bar
```

---

## What the User Never Sees (But Always Benefits From)

| Behind the Scenes | User Benefit |
|------------------|-------------|
| LRU cache (15-min TTL) on all API calls | Fast responses, zero repeated API charges |
| 3-second timeout on every external call | App never hangs or crashes |
| Fallback defaults for every API | Always gets an answer, even offline |
| Model pre-warmed on server startup | Zero lag on first prediction during demo |
| Weighted signal scoring per location type | Beach predictions care about tides; station predictions care about rush hour |
| Twitter/X real-time social scan | Crowd reports that no dataset captures |

---

*CrowdSense Mumbai · Team Technexis · Hack4Innovation 2026*
