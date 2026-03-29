import yaml
import time
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os

from fastapi.security import APIKeyHeader
from fastapi import Security, HTTPException, status

# B2B Monetization Structure (OpenAPI Schema)
app = FastAPI(
    title="CrowdSense Urban Intelligence API",
    description="Enterprise-grade ambient AI predicting transit crowd surges in Mumbai using live spatial-temporal data.",
    version="1.0.0",
    terms_of_service="http://crowdsense.ai/terms",
    contact={
        "name": "Team Technexis",
        "url": "http://crowdsense.ai/support",
    },
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# API Key Security for B2B Clients
API_KEY_NAME = "x-api-key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    # Simple hardcoded check for the hackathon demo
    if api_key_header == "CROWDSENSE_ENTERPRISE_KEY_2026":
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API Key"
    )

@app.on_event("startup")
async def startup_event():
    print(f"[{datetime.now().isoformat()}] Pre-warming models...")
    try:
        from agents.langgraph_flow import run_agent
        run_agent("pre-warm cold start dummy query")
        print("Langchain/LLM agent pre-warmed.")
    except Exception as e:
        print(f"Agent pre-warm failed: {e}")
        
    try:
        from api.routes import crowd_model
        if crowd_model:
            import numpy as np
            dummy_features = np.zeros((1, 16))
            crowd_model.predict(dummy_features)
            print("ML model pre-warmed.")
    except Exception as e:
        print(f"ML Model pre-warm failed: {e}")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    timestamp = datetime.now().isoformat()
    # Log to console
    print(f"[{timestamp}] {request.method} {request.url.path} - Status: {response.status_code} - Processing Time: {process_time:.4f}s")
    return response



# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load config at startup
def load_config():
    config_path = os.path.join(os.path.dirname(__file__), "config.yaml")
    with open(config_path, "r") as f:
        return yaml.safe_load(f)

app.state.config = load_config()

from api.routes import router

app.include_router(router)


# ─── WebSocket: Real-time Crowd Stream ───────────────────────────────────────

from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        msg = json.dumps(data)
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(msg)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

ws_manager = ConnectionManager()


@app.websocket("/ws/live")
async def crowd_stream(websocket: WebSocket):
    """
    Real-time crowd snapshot stream.
    Sends a full zone snapshot every 15 seconds.
    Client receives: { type: "snapshot", pulse: {...}, top_zones: [...], ts: ... }
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            from api.routes import _build_all_zone_scores, get_mock_crowd_score
            from model.cascade_engine import compute_network_pulse
            import time

            # Build zone data + pulse
            try:
                from datetime import datetime as _dt
                now = _dt.now()
                zones = _build_all_zone_scores(now.hour, use_live_weather=False)  # No weather for speed
                pulse = compute_network_pulse(zones)
                top5 = [{"location": z["location"], "score": z["crowd_score"], "type": z["type"]} for z in zones[:5]]
                safe5 = [{"location": z["location"], "score": z["crowd_score"], "type": z["type"]} for z in zones[-5:]]

                payload = {
                    "type": "snapshot",
                    "pulse": pulse["pulse"],
                    "status": pulse["status"],
                    "color": pulse["color"],
                    "advice": pulse["advice"],
                    "critical_zone_count": pulse["critical_zone_count"],
                    "top_zones": top5,
                    "safe_zones": safe5,
                    "total_zones": len(zones),
                    "hour": now.hour,
                    "ts": time.time(),
                }
                await websocket.send_text(json.dumps(payload))
            except Exception as e:
                await websocket.send_text(json.dumps({"type": "error", "msg": str(e)}))

            await asyncio.sleep(15)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
