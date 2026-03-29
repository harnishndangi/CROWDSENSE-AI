# CrowdSense Mumbai 🚀
**Predict the crowd. Beat the rush.**

CrowdSense Mumbai uses machine learning and AI agents to predict crowd levels across 20+ key locations in Mumbai (railway stations, beaches, temples, markets). It helps commuters plan their trips and city planners understand historical patterns.

---

## 🏗️ Project Structure
- `backend/`: FastAPI server with ML inference and agent logic.
- `frontend/`: Next.js frontend for the commuter dashboard.
- `model/`: Machine learning model training scripts and saved weights.
- `agents/`: LangGraph agent pipelines for reasoning about crowd signals.
- `tools/`: External API integrations (Weather, Traffic).

---

## 🛠️ Getting Started

### 1. Prerequisite Environments
- **Python**: 3.10+
- **Node.js**: 18.x or above
- **Package Managers**: `pip` and `npm`

---

### 2. Backend Initialization (API)
The backend manages the crowd labels, ML model, and AI agent reasoning.

1.  **Install dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

2.  **Configuration**:
    - Update `backend/config.yaml` for location metadata.
    - Create a `.env` file in the root with your API keys:
      ```env
      GROQ_API_KEY=your_key_here
      OPENWEATHER_API_KEY=your_key_here
      GOOGLE_MAPS_API_KEY=your_key_here
      ```

3.  **Run the server**:
    ```bash
    python main.py
    ```
    The API will be available at `http://localhost:8000`. You can visit `/docs` for the interactive API documentation.

---

### 3. Frontend Initialization (Dashboard)
The frontend provides a real-time dashboard for commuters.

1.  **Install dependencies**:
    ```bash
    cd frontend
    npm install
    ```

2.  **Environment Setup**:
    - Ensure your `.env.local` points to the backend API if needed.

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    Access the dashboard at `http://localhost:3000`.

---

## 🧠 Key Features
- **Real-time Crowd Prediction**: Uses a Random Forest Classifier trained on synthetic Mumbai behavioral data.
- **AI-Powered Reasoning**: LangGraph agents explain *why* it's crowded using live weather and traffic signals.
- **Scenario Simulation**: Toggle "Monsoon" or "Festival" modes to see how predictions change.
- **City Planner Heatmaps**: Weekly views of crowd trends for urban planning.

---

## 👥 The Team
- **Member A**: Backend (FastAPI + ML)
- **Member B**: Agents (LangGraph + Tools)
- **Member C**: Frontend (Next.js / Streamlit + Viz)