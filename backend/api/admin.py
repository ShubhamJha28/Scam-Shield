from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.database import get_db
import db.models as models

router = APIRouter()

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """
    Returns aggregated statistics for the admin dashboard.
    """
    total_scans = db.query(models.ScamScan).count()
    
    # Calculate threats (high risk + critical)
    threats = db.query(models.ScamScan).filter(
        models.ScamScan.verdict.in_(["CRITICAL", "HIGH_RISK", "CRITICAL_RISK"])
    ).count()
    
    # Safely get money lost
    total_incidents = db.query(models.IncidentReport).count()
    total_money_lost = db.query(func.sum(models.IncidentReport.amount_lost)).scalar() or 0
    
    # Most common scam types (top 5)
    common_scams = db.query(
        models.ScamScan.scam_type, 
        func.count(models.ScamScan.id).label('count')
    ).group_by(models.ScamScan.scam_type).order_by(func.count(models.ScamScan.id).desc()).limit(5).all()
    
    return {
        "total_scans": total_scans,
        "total_threats_intercepted": threats,
        "total_incidents_reported": total_incidents,
        "total_money_lost_inr": total_money_lost,
        "top_scam_types": [{"type": s[0], "count": s[1]} for s in common_scams if s[0]]
    }
