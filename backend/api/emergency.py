from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
import db.models as models

router = APIRouter()

class IncidentReportDTO(BaseModel):
    victim_name: str
    bank_name: str
    amount_lost: float
    utr: str
    description: str

@router.post("/draft")
def generate_draft(report: IncidentReportDTO, db: Session = Depends(get_db)):
    """
    Generates a formal complaint draft for 1930 / I4C and logs it.
    """
    draft = f"""
To The Cyber Cell / Nodal Officer,

I am writing to formally report an unauthorized financial fraud incident.

Victim Name: {report.victim_name}
Bank: {report.bank_name}
Amount Lost: ₹{report.amount_lost}
Transaction Reference (UTR): {report.utr}

Incident Description:
{report.description}

I request immediate lien/freezing of the beneficiary account to prevent further loss.
"""

    try:
        # Save incident to database
        db_incident = models.IncidentReport(
            victim_name=report.victim_name,
            bank_name=report.bank_name,
            amount_lost=report.amount_lost,
            utr=report.utr,
            description=report.description
        )
        db.add(db_incident)
        db.commit()
    except Exception as e:
        # If UTR is already reported, etc.
        print(f"Error saving incident to DB: {e}")
        db.rollback()
    
    return {
        "status": "success",
        "draft_content": draft.strip()
    }

@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    """
    Fetches all logged 1930 incident reports.
    """
    return db.query(models.IncidentReport).order_by(models.IncidentReport.timestamp.desc()).all()
