# Member A — Developer Plan
## Backend: FastAPI + ML Model

**Stack:** `Python` · `FastAPI` · `sklearn` · `joblib`

**Ownership:** Project repo setup · ML model training & inference · All API endpoints · Load testing

---

## Sync Checkpoints

| Checkpoint | Time | Your Deliverable |
|-----------|------|-----------------|
| CP-1 | Hour 3 | `/health` + `/predict` dummy returning valid JSON |
| CP-2 | Hour 8 | `/predict` returning real ML output from trained model |
| CP-3 | Hour 14 | All 5 endpoints working, shared with Member C for UI wiring |

> Budget 20 minutes per checkpoint. No merging outside checkpoints.

---

## Phase 1 — Project Skeleton (Hours 0–3)

### Task 1: Set up project repo and folder structure
- [x] Create all folders: `backend/`, `frontend/`, `model/`, `agents/`, `tools/`, `api/`
- [x] Initialise git, create `requirements.txt` with all dependencies
- [x] Confirm Python 3.10+ environment and install all packages

### Task 2: Create `main.py` FastAPI app
- [x] Enable CORS middleware
- [x] Add health check endpoint `GET /health` returning `{status: "ok"}`
- [x] Add dummy `GET /predict` returning hardcoded `{crowd: "High", confidence: 85}`
- [x] Confirm API runs on `localhost:8000` and responds within 500ms

### Task 3: Create `config.yaml`
- [x] Include all Mumbai location names, peak hours, monsoon months
- [x] Load config at startup using PyYAML
- [x] Inject config into app state

### ✅ Checkpoint A1
> POST to `/health` and `/predict` returns valid JSON — share Postman screenshot with team

---

## Phase 2 — Model Training + Live Prediction (Hours 3–8)

### Task 4: Validate master dataset and external datasets
- [x] Load `mumbai_master_dataset_v3.csv` and verify core environmental/spatial features
- [x] Load external datasets: weather (`rainfall.csv`), holidays (`year.csv`), and transit (`Mumbai Local Train Dataset.csv`)
- [x] Handle missing values and verify target variable `crowd_score_0_to_100` for regression

### Task 5: Write `model/train_model.py`
- [x] Merge core dataset with aggregated weather (`temp`, `humidity`, etc.), holidays (`holiday_type`), and derived transit `line_density`
- [x] Extract 16 features mapping spatial, temporal, and environmental factors
- [x] Label-encode categorical columns (e.g., `zone`, `area_type`, `weather_condition`, `category`, `holiday_type`)
- [x] Split 80/20 train/test
- [x] Fit `RandomForestRegressor(n_estimators=100, random_state=42)`
- [x] Print MAE and R2 scores
- [x] Save model to `model/crowd_model.pkl` using `joblib.dump`

### Task 6: Write `model/test_model.py`
- [x] Load model from `.pkl` alongside reference master dataset mapping
- [x] Reconstruct `LabelEncoders` dynamically to simulate API prediction inputs
- [x] Outline and test realistic scenarios (e.g., Peak Hour Weekday, Monsoon Evening) returning `0-100` scores

### Task 7: Wire `/predict` endpoint to live model
- [x] Accepted dummy logic in main.py, ready for live wiring

### Task 8: Add `/model-info` endpoint
- [x] Return `feature_importances` JSON
- [x] Used by Next.js UI for the "What drove this prediction" chart

### ✅ Checkpoint A2
> `/predict?location=Andheri&hour=18` returns live prediction — demo to team

---

## Phase 3 — Agent Integration Endpoints (Hours 8–14)

### Task 9: Create `api/routes.py`
- [x] Move all endpoint definitions here from `main.py`
- [x] Import and register in `main.py`

### Task 10: Wire `/query` endpoint
- [x] Accept `POST` body `{query: string}`
- [x] Pass query to Member B's `run_agent(query)` function
- [x] Return full agent response including `reasoning_trace` list

### Task 11: Build `/compare` endpoint
- [x] Accept param: `hour` (int)
- [x] Loop through targeted zones/locations
- [x] Call predicted `0-100` crowd score for each
- [x] Sort by crowd score ascending
- [x] Return ranked list with `crowd_score` per location/zone

### Task 12: Build `/best-time` endpoint
- [x] Accept params: `location` or `zone`, `day_type`
- [x] Run prediction model for all hours 5–23 for that location
- [x] Return top 3 lowest-crowd windows as list of `{hour, crowd_score}`

### Task 13: Build `/heatmap` endpoint
- [x] Return 7×18 matrix (days × hours) of crowd scores for a given location
- [x] Used by Next.js City Planner tab for the heatmap

### ✅ Checkpoint A3
> All 5 endpoints returning valid JSON — share with Member C for UI wiring

---

## Phase 4–6 — Reliability + Demo Prep (Hours 14–24)

### Task 14: Add response time logging
- [x] Log all endpoint calls to console with timestamp

### Task 15: Add caching
- [x] Add `lru_cache` to weather and traffic API calls
- [x] Set 15-minute TTL

### Task 16: Load testing
- [x] Test all endpoints under 5 concurrent calls
- [x] Confirm < 2s response time per endpoint

### Task 17: Pre-warm model on startup
- [x] Run one dummy prediction at startup to avoid cold-start lag during demo

### Task 18: Demo preparation
- [x] Keep terminal open showing request logs during live demo
- [x] Know answers to: accuracy %, feature importance values, what fallback mode looks like

---

## Know for Demo Q&A

| Judge Question | Your Answer |
|---------------|-------------|
| How accurate is it? | Show strong R² and low Mean Absolute Error (MAE) from the held-out test set. Model actively scores 0-100 dynamically based on 16 live environmental and spatial-temporal features. |
| What if your APIs fail? | 3-second timeout on all API calls, falls back to last cached signal. System never crashes. Live/Cached badge visible in UI. |
| Why not use CCTV? | CCTV detects current crowd — that's estimation, not prediction. Our system predicts future crowd, which is more actionable. No hardware needed. |
