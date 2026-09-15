from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import time
import os
import shutil

from services.deterministic import analyze_text
from services.semantic import analyze_with_llm
from services.vision import extract_text_from_image
from services.qr import extract_upi_from_qr
from services.url_scraper import scrape_url_content
from api.emergency import router as emergency_router
from api.whatsapp import router as whatsapp_router
from api.admin import router as admin_router

# DB Imports
from db.database import engine, get_db
import db.models as models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ScamShield Backend",
    description="Backend services for ScamShield hybrid detection engine with SQLite persistence.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp_uploads", exist_ok=True)

class TextPayload(BaseModel):
    text: str

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "ScamShield Backend is running"}

@app.post("/api/analyze/text")
def analyze_text_endpoint(payload: TextPayload, db: Session = Depends(get_db)):
    start_time = time.time()
    
    # Stage 1: Deterministic Engine
    is_conclusive, result = analyze_text(payload.text)
    
    if is_conclusive:
        result["engine_used"] = "deterministic"
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
    else:
        # Stage 2: Semantic AI Engine
        result = analyze_with_llm(payload.text)
        result["engine_used"] = "semantic_llm"
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        
    # Save the scan to the database!
    db_scan = models.ScamScan(
        payload_content=payload.text,
        threat_score=result.get("threat_score", 0),
        verdict=result.get("verdict", "UNKNOWN"),
        scam_type=result.get("scam_type", "Unknown"),
        explanation=result.get("explanation", ""),
        engine_used=result.get("engine_used", "")
    )
    db.add(db_scan)
    db.commit()
    
    return result

@app.post("/api/analyze/image")
async def analyze_image_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    start_time = time.time()
    file_path = f"temp_uploads/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    extracted_text = extract_text_from_image(file_path)
    os.remove(file_path)
    
    if not extracted_text:
        return {
            "threat_score": 0,
            "verdict": "SAFE",
            "scam_type": "No Text Found",
            "explanation": "Could not extract any text from the provided image.",
            "engine_used": "vision_ocr",
            "latency_ms": round((time.time() - start_time) * 1000, 2)
        }
        
    # Pipe extracted text into the text analyzer
    is_conclusive, result = analyze_text(extracted_text)
    if is_conclusive:
        result["engine_used"] = "deterministic (via OCR)"
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
    else:
        result = analyze_with_llm(extracted_text)
        result["engine_used"] = "semantic_llm (via OCR)"
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
        
    # Append the extracted text context for the UI
    result["explanation"] = f"(Extracted text: '{extracted_text[:30]}...') {result.get('explanation', '')}"

    db_scan = models.ScamScan(
        payload_content=f"[IMAGE OCR] {extracted_text}",
        threat_score=result.get("threat_score", 0),
        verdict=result.get("verdict", "UNKNOWN"),
        scam_type=result.get("scam_type", "Unknown"),
        explanation=result.get("explanation", ""),
        engine_used=result.get("engine_used", "")
    )
    db.add(db_scan)
    db.commit()
    
    return result

@app.post("/api/analyze/qr")
async def analyze_qr_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    start_time = time.time()
    file_path = f"temp_uploads/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    qr_data = extract_upi_from_qr(file_path)
    os.remove(file_path)
    
    if "error" in qr_data:
        return {
            "threat_score": 0,
            "verdict": "SAFE",
            "scam_type": "Invalid QR",
            "explanation": qr_data["error"],
            "engine_used": "qr_decoder",
            "latency_ms": round((time.time() - start_time) * 1000, 2)
        }
        
    # Advanced UPI Heuristics
    threat_score = 0
    flags = []
    
    vpa = qr_data.get("vpa", "").lower()
    payee = qr_data.get("payee_name", "").lower()
    
    # 1. Trusted Namespaces
    trusted_namespaces = ["@ybl", "@ibl", "@axl", "@paytm", "@okicici", "@okhdfcbank", "@sbi", "@apl", "@upi", "@postbank"]
    is_trusted_namespace = any(vpa.endswith(ns) for ns in trusted_namespaces)
    if not is_trusted_namespace:
        threat_score += 25
        flags.append(f"VPA namespace appears non-standard or unregistered ({vpa.split('@')[-1] if '@' in vpa else 'unknown'}).")
        
    # 2. Payee Name Scam Keywords (Common in India)
    scam_keywords = ["cashback", "refund", "support", "customer care", "helpline", "reward", "winner", "prize", "offer", "kyc", "update"]
    if any(keyword in payee for keyword in scam_keywords):
        threat_score += 40
        flags.append(f"Payee name '{payee}' contains known social engineering keywords.")
        
    # 3. Pre-filled Amount
    if qr_data.get("is_prefilled_amount"):
        amount = qr_data.get("amount", "0")
        threat_score += 35
        flags.append(f"QR contains a pre-filled amount (₹{amount}). Scanning this will debit money, NOT receive money.")
        
    # 4. Merchant vs P2P
    if not vpa.endswith(".pnq@") and not ".biz@" in vpa and not "merchant" in payee:
         # P2P VPAs are often 10-digit phone numbers
         import re
         if re.match(r'^\d{10}@', vpa):
             threat_score += 10
             flags.append("QR routes to a personal phone number, not a registered merchant.")
             
    # Base risk for random unknown QR
    if threat_score == 0:
        threat_score = 15
        
    verdict = "CRITICAL" if threat_score >= 75 else "HIGH_RISK" if threat_score >= 50 else "MODERATE_RISK" if threat_score >= 30 else "SAFE"
    
    result = {
        "threat_score": min(100, threat_score),
        "verdict": verdict,
        "scam_type": "UPI Phishing / Coercion" if threat_score >= 50 else "Unknown",
        "explanation": " ".join(flags) if flags else f"Verified UPI routing to {qr_data.get('payee_name', 'merchant')}.",
        "recommended_action": "Do not enter UPI PIN if you expect to receive money." if qr_data.get("is_prefilled_amount") else "Proceed with caution.",
        "engine_used": "qr_decoder",
        "latency_ms": round((time.time() - start_time) * 1000, 2)
    }

    db_scan = models.ScamScan(
        payload_content=f"[QR DECODED] {qr_data.get('raw_url')}",
        threat_score=result.get("threat_score", 0),
        verdict=result.get("verdict", "UNKNOWN"),
        scam_type=result.get("scam_type", "Unknown"),
        explanation=result.get("explanation", ""),
        engine_used=result.get("engine_used", "")
    )
    db.add(db_scan)
    db.commit()
    
    return result

class UrlPayload(BaseModel):
    url: str

@app.post("/api/analyze/url")
def analyze_url_endpoint(payload: UrlPayload, db: Session = Depends(get_db)):
    start_time = time.time()
    
    # 1. First run deterministic checks on the URL string itself
    is_conclusive, result = analyze_text(payload.url)
    
    if is_conclusive and result.get("verdict") in ["CRITICAL", "HIGH_RISK"]:
        # If the URL is overtly malicious (e.g. sbi-update-kyc.xyz), we don't even need to visit it.
        result["engine_used"] = "deterministic (URL filter)"
        result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
    else:
        # 2. If the URL itself doesn't trigger alarms, visit the site and scrape the DOM
        scraped_text = scrape_url_content(payload.url)
        
        if "Error scraping" in scraped_text or "Failed to parse" in scraped_text:
            result = {
                "threat_score": 60,
                "verdict": "MODERATE_RISK",
                "scam_type": "Unreachable/Blocked Host",
                "explanation": f"Could not verify the contents of the page. It may be blocking scrapers or currently offline. ({scraped_text})",
                "engine_used": "url_scraper",
                "latency_ms": round((time.time() - start_time) * 1000, 2)
            }
        else:
            # 3. Feed the scraped DOM into the Gemini LLM
            llm_result = analyze_with_llm(scraped_text)
            llm_result["engine_used"] = "semantic_llm (via URL Scraper)"
            llm_result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
            llm_result["explanation"] = f"(Scraped DOM): {llm_result.get('explanation', '')}"
            result = llm_result

    db_scan = models.ScamScan(
        payload_content=f"[URL SCAN] {payload.url}",
        threat_score=result.get("threat_score", 0),
        verdict=result.get("verdict", "UNKNOWN"),
        scam_type=result.get("scam_type", "Unknown"),
        explanation=result.get("explanation", ""),
        engine_used=result.get("engine_used", "")
    )
    db.add(db_scan)
    db.commit()
    
    return result

@app.post("/api/analyze/audio")
async def analyze_audio_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    start_time = time.time()
    file_path = f"temp_uploads/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    os.remove(file_path)
    
    # [HACKATHON MOCK] Simulate Whisper AI Transcription for Deepfake Call
    mock_transcript = "Hello, this is Inspector Rajesh from Customs. Your parcel contains illegal items. If you do not pay a fine of 50,000 rupees immediately to the provided account, an arrest warrant will be issued."
    
    llm_result = analyze_with_llm(mock_transcript)
    llm_result["engine_used"] = "semantic_llm (via Whisper STT)"
    llm_result["latency_ms"] = round((time.time() - start_time) * 1000, 2)
    llm_result["explanation"] = f"(Transcribed Audio): {llm_result.get('explanation', '')}"
    
    db_scan = models.ScamScan(
        payload_content=f"[AUDIO UPLOAD] {file.filename}",
        threat_score=llm_result.get("threat_score", 0),
        verdict=llm_result.get("verdict", "UNKNOWN"),
        scam_type=llm_result.get("scam_type", "Unknown"),
        explanation=llm_result.get("explanation", ""),
        engine_used=llm_result.get("engine_used", "")
    )
    db.add(db_scan)
    db.commit()
    
    return llm_result

@app.get("/api/threats")
def get_recent_threats(db: Session = Depends(get_db), limit: int = 50):
    """
    Returns the most recent scam scans from the database.
    Useful for populating the Threat Intelligence dashboard.
    """
    scans = db.query(models.ScamScan).order_by(models.ScamScan.timestamp.desc()).limit(limit).all()
    return scans

app.include_router(emergency_router, prefix="/api/emergency", tags=["Emergency"])
app.include_router(whatsapp_router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
