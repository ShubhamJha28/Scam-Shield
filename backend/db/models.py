from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from .database import Base

class ScamScan(Base):
    __tablename__ = "scam_scans"

    id = Column(Integer, primary_key=True, index=True)
    payload_content = Column(String, index=True)
    threat_score = Column(Float)
    verdict = Column(String)
    scam_type = Column(String)
    explanation = Column(String)
    engine_used = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

class IncidentReport(Base):
    __tablename__ = "incident_reports"

    id = Column(Integer, primary_key=True, index=True)
    victim_name = Column(String)
    bank_name = Column(String)
    amount_lost = Column(Float)
    utr = Column(String, unique=True, index=True)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
