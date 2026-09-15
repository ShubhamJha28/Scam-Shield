from fastapi import APIRouter, Form, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from db.database import get_db
import db.models as models
from services.semantic import analyze_with_llm

router = APIRouter()

@router.post("/webhook")
async def twilio_whatsapp_webhook(
    Body: str = Form(...),
    From: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint to handle incoming messages from Twilio WhatsApp API.
    Citizens can forward suspicious messages directly to the WhatsApp bot.
    """
    
    # Run the incoming WhatsApp message through our AI engine
    result = analyze_with_llm(Body)
    
    verdict = result.get("verdict", "UNKNOWN")
    score = result.get("threat_score", 0)
    explanation = result.get("explanation", "Could not analyze.")
    
    # Log the scam silently to our database so the Admin Dashboard sees it!
    db_scan = models.ScamScan(
        payload_content=f"[WhatsApp Forward] {Body[:200]}...",
        threat_score=score,
        verdict=verdict,
        scam_type=result.get("scam_type", "Unknown WhatsApp Threat"),
        explanation=explanation,
        engine_used="semantic_llm (via Twilio Bot)"
    )
    db.add(db_scan)
    db.commit()

    # Format the reply for WhatsApp
    if verdict in ["CRITICAL", "HIGH_RISK"]:
        reply_text = f"🚨 *ScamShield Alert: HIGH RISK* 🚨\n\nThreat Score: {score}/100\n\n{explanation}\n\n*DO NOT click any links or send money.* Report this immediately by calling 1930."
    elif verdict == "MODERATE_RISK":
        reply_text = f"⚠️ *ScamShield: MODERATE RISK*\n\n{explanation}\n\nProceed with extreme caution. Do not share OTPs."
    else:
        reply_text = f"✅ *ScamShield: SAFE*\n\n{explanation}\n\nThis message appears safe, but always stay vigilant!"

    # Twilio expects TwiML (XML) response
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Message>{reply_text}</Message>
    </Response>"""
    
    return Response(content=twiml_response, media_type="application/xml")
