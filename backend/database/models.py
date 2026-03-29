from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "crowdsense_telemetry.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PredictionLog(Base):
    __tablename__ = "prediction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String, index=True)
    target_hour = Column(Integer)
    prediction = Column(String)
    raw_score = Column(Float)
    confidence = Column(Float)
    traffic_ratio = Column(Float, nullable=True)
    active_incidents = Column(Integer, nullable=True)
    weather_cond = Column(String, nullable=True)
    event_count = Column(Integer, nullable=True)

class LiveReport(Base):
    __tablename__ = "live_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String, index=True)
    report_type = Column(String) # "Stampede Risk", "Train Halted", "Surprisingly Empty"
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

Base.metadata.create_all(bind=engine)

def log_prediction(state: dict):
    """Saves the LangGraph inference snapshot to build our proprietary dataset."""
    db = SessionLocal()
    try:
        log = PredictionLog(
            location=state.get("location"),
            target_hour=state.get("hour"),
            prediction=state.get("prediction"),
            raw_score=state.get("raw_score"),
            confidence=state.get("confidence"),
            traffic_ratio=float(state.get("traffic", {}).get("congestion_ratio", 1.0)) if state.get("traffic") else None,
            active_incidents=state.get("tomtom", {}).get("incidents", {}).get("count", 0) if state.get("tomtom") else 0,
            weather_cond=state.get("weather", {}).get("condition", "Unknown") if state.get("weather") else None,
            event_count=len(state.get("events", [])) if state.get("events") else 0
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"Telemetry DB Error: {e}")
    finally:
        db.close()

def add_live_report(location: str, report_type: str, lat: float = None, lng: float = None):
    db = SessionLocal()
    try:
        report = LiveReport(location=location, report_type=report_type, lat=lat, lng=lng)
        db.add(report)
        db.commit()
        return True
    except Exception as e:
        print(f"Live Report DB Error: {e}")
        return False
    finally:
        db.close()

def get_recent_live_reports(location: str, max_age_minutes: int = 60):
    db = SessionLocal()
    try:
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(minutes=max_age_minutes)
        # Using simple name matching for now
        reports = db.query(LiveReport).filter(
            LiveReport.location.ilike(f"%{location}%"),
            LiveReport.timestamp >= cutoff
        ).order_by(LiveReport.timestamp.desc()).all()
        return [
            {"report_type": r.report_type, "timestamp": r.timestamp.isoformat()}
            for r in reports
        ]
    except Exception as e:
        print(f"Get Reports Error: {e}")
        return []
    finally:
        db.close()
