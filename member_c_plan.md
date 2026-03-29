# Member C — Developer Plan
## Frontend: Streamlit UI + Data Pipeline

**Stack:** `Python` · `Streamlit` · `Plotly` · `Pandas`

**Ownership:** Synthetic dataset generation · API key registration · Streamlit app shell · All UI components · Charts and visualisations

---

## Sync Checkpoints

| Checkpoint | Time | Your Deliverable |
|-----------|------|-----------------|
| CP-1 | Hour 3 | CSV generated and committed, Streamlit shell running with dummy data |
| CP-2 | Hour 8 | Commuter tab fully wired to live `/predict`, heatmap visible |
| CP-3 | Hour 14 | NL query working with reasoning trace animation — show team |

> Budget 20 minutes per checkpoint. No merging outside checkpoints.

---

## ⚡ First 20 Minutes — Critical Dependency

> **The synthetic CSV must be generated and committed before anything else.** This is the dependency for Member A's model training. If this is delayed, the entire team is blocked.

---

## Phase 1 — Data Generation + App Shell (Hours 0–3)

### Task 1: Generate synthetic dataset ← DO THIS FIRST
- [ ] Execute the synthetic data generator script immediately at hackathon start
- [ ] Verify output: **2500 rows, 9 columns, all 4 crowd labels present, no nulls**
- [ ] Required columns: `location`, `location_type`, `hour`, `day_type`, `weather_code`, `traffic_level`, `is_event`, `month`, `crowd_label`
- [ ] Save to `backend/data/mumbai_crowd.csv`
- [ ] Commit to repo — notify Member A immediately

### Task 2: Register API keys (if not done pre-hackathon)
- [ ] **OpenWeather:** `openweathermap.org/api` — free tier, instant key → save as `OPENWEATHER_API_KEY`
- [ ] **Google Maps:** `console.cloud.google.com` — enable Routes API + Places API → save as `GOOGLE_MAPS_API_KEY`
- [ ] **Groq:** `console.groq.com` — free tier, instant key → save as `GROQ_API_KEY`
- [ ] Save all keys to `.env` file in project root

### Task 3: Create Streamlit app shell (`frontend/app.py`)
- [ ] Set page config: `st.set_page_config(page_title='CrowdSense Mumbai', layout='wide')`
- [ ] Create three tabs: `Commuter`, `City Planner`, `Event Organizer`
- [ ] Add sidebar:
  - Location dropdown (all 20 locations)
  - Hour slider (5–23)
  - Weather toggle
  - Event toggle
- [ ] Confirm app runs with `streamlit run app.py` — tabs visible, no errors

### Task 4: Create `components/crowd_card.py`
- [ ] Accepts dict: `{label, confidence, reasons, suggestions, source}`
- [ ] Renders large coloured label:
  - 🔴 `Very High` → red
  - 🟠 `High` → orange
  - 🟡 `Medium` → yellow
  - 🟢 `Low` → green
- [ ] Renders confidence % as `st.metric`
- [ ] Renders 3 bullet-point reasons
- [ ] Renders 2 suggestions as blue callout boxes (`st.info`)
- [ ] Renders `Live` / `Cached` badge using `source` field

### ✅ Checkpoint C1
> Streamlit app running with dummy data populating all three tabs — show team

---

## Phase 2 — API Wiring + Charts (Hours 3–8)

### Task 5: Wire Commuter tab to live `/predict` endpoint
- [ ] On location / hour / toggle change, call `GET /predict` with params
- [ ] Pass response to `crowd_card` component
- [ ] Show `st.spinner("Predicting...")` during API call
- [ ] Wrap call in `try/except` — show friendly error card on failure, never expose stack trace

### Task 6: Build 24-hour crowd trend chart
- [ ] On location select, loop `GET /predict` for hours 5–23
- [ ] Plot as `st.line_chart` with custom colours:
  - Green: score < 2
  - Yellow: score < 4
  - Orange: score < 6
  - Red: score >= 6
- [ ] Add vertical line at current hour

### Task 7: Build City Planner weekly heatmap
- [ ] Call `/heatmap` endpoint for selected location
- [ ] Render as `plotly go.Heatmap`:
  - X-axis: hours (6AM–11PM)
  - Y-axis: days (Mon–Sun)
  - Colorscale: green → yellow → red
  - Add text labels in cells: `Low / Medium / High / Very High`
- [ ] **This is the screenshot judges take — make it clean and readable**

### Task 8: Build feature importance bar chart
- [ ] Call `/model-info` endpoint once on app load
- [ ] Render as `st.bar_chart` in sidebar or below prediction card
- [ ] Label it: `"What drove this prediction"`

### ✅ Checkpoint C2
> Commuter tab fully working with live API, heatmap visible — demo to team

---

## Phase 3 — NL Query + Reasoning Trace (Hours 8–14)

### Task 9: Add natural language query input to Commuter tab
- [ ] Add `st.text_input("Ask anything, e.g. Will Andheri be crowded at 6 PM?")`
- [ ] On submit, call `POST /query` with `{query: string}`
- [ ] Pass response to `crowd_card` component + `reasoning_trace` component

### Task 10: Create `components/reasoning_trace.py`
- [ ] Accepts list of step strings from agent pipeline
- [ ] Renders each step sequentially using `st.empty()` with 0.3s delay between steps
- [ ] Style: monospace font, left-bordered box, step number prefix
- [ ] **This is the "AI is thinking" moment — make it visually clear**

### Task 11: Build Event Organizer tab
- [ ] Inputs: event location, event date/time, expected capacity
- [ ] Construct query: `"I am hosting an event at {location} at {time}. What crowd should I expect?"`
- [ ] Call `POST /query` with constructed query
- [ ] Show prediction + reasoning + gate recommendation (derived from crowd level)

### ✅ Checkpoint C3
> NL query working with reasoning trace animation — show team

---

## Phase 4–6 — Simulation Toggles + Polish (Hours 14–24)

### Task 12: Build simulation toggles panel
- [ ] **Monsoon rain toggle:** sets `weather_override=1` in API call
- [ ] **Event nearby toggle:** sets `event_override=1` in API call
- [ ] On toggle change: re-call prediction and update card **in place** — no full page reload
- [ ] Add note under card: `"Showing simulated scenario: Rain + Event"`

### Task 13: Build multi-station compare view
- [ ] In City Planner tab, add `"Compare all stations at this hour"` button
- [ ] Call `/compare` endpoint
- [ ] Render as horizontal `st.bar_chart` sorted by crowd level
- [ ] Colour bars by crowd level
- [ ] **This is the chart judges photograph**

### Task 14: Polish entire UI
- [ ] Add project name `CrowdSense Mumbai` as header with tagline *"Predict the crowd. Beat the rush."*
- [ ] Add About section in sidebar: problem, approach, stack, scalability claim
- [ ] Test all tabs with no crashes across 3 complete demo runs

### Task 15: Pre-load demo scenarios
- [ ] Pre-fill NL query box with: `"Will Andheri station be crowded tonight at 7 PM?"`
- [ ] Set default location: `Andheri Station`
- [ ] Set default hour: `18`
- [ ] **This avoids typing errors during live demo — demo starts already loaded**

---

## Dataset Schema Reference

| Column | Type | Values | Notes |
|--------|------|--------|-------|
| `location` | string | 20 Mumbai places | From MUMBAI_LOCATIONS registry |
| `location_type` | string | railway/metro/bus_stop/cab_zone/religious/beach/mall/market | Encoded as int for model |
| `hour` | int | 5–23 | 24-hour format |
| `day_type` | int | 0=weekday, 1=weekend | Derived from day of week |
| `weather_code` | int | 0=clear, 1=rain, 2=storm | From OpenWeather mapping |
| `traffic_level` | int | 0=low, 1=medium, 2=high | From Google Maps ratio |
| `is_event` | int | 0 or 1 | Festival/concert/match flag |
| `month` | int | 1–12 | Monsoon months (6–9) get weather boost |
| `crowd_label` | string | Low/Medium/High/Very High | Target variable |

---

## Know for Demo Q&A

| Judge Question | Your Answer |
|---------------|-------------|
| Why not just Google it? | Google shows current crowding at popular places. We predict future crowd across ALL transport modes with reasoning — including bus stops, auto stands, and religious places Google doesn't cover. |
| Is this data real? | Synthetic data built on real Mumbai behavioral patterns — CR/WR peak hours, monsoon impact, festival spikes — validated against known crowd events. Plus live weather and traffic APIs. |
| Can it scale beyond Mumbai? | Yes. Swap `config.yaml` and the location CSV. Delhi Metro or Bangalore BMTC in under an hour. The agent context is the only thing that needs updating. |
| Who would pay for this? | Three paths: B2C commuter app (freemium), B2B API to BEST/MMRDA for operations, white-label to event companies for footfall prediction. |
