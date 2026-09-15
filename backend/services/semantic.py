import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-flash-latest for fast semantic analysis
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

def analyze_with_llm(text: str) -> dict:
    """
    Stage 2: Semantic AI Engine
    Runs only if Stage 1 is inconclusive. Uses Gemini to evaluate psychological coercion and Hindi/English slang.
    """
    
    # Fallback mock if no API key is provided
    if not model:
        return {
            "threat_score": 45,
            "verdict": "MODERATE_RISK",
            "scam_type": "Suspicious Communication",
            "explanation": "Mock LLM fallback (API Key missing). The message lacks explicit threats but requests non-standard action.",
            "recommended_action": "Proceed with caution. Do not share OTPs."
        }
        
    prompt = f"""
You are ScamShield, an advanced cybersecurity AI designed to protect citizens in India.
Analyze the following text message, which may contain Hindi-English (Hinglish) slang, local dialects, or psychological coercion tactics.

Message: "{text}"

Evaluate the message for:
1. Urgency manipulation (e.g., account block, immediate payment required).
2. Suspicious sender intent (e.g., pretending to be SBI, HDFC, police, customs).
3. Requests for sensitive data (OTP, PIN, passwords, downloading APKs).

Output your response STRICTLY as a valid JSON object matching exactly this schema:
{{
  "threat_score": <integer from 0 to 100>,
  "verdict": <string: "SAFE", "LOW_RISK", "MODERATE_RISK", "HIGH_RISK", or "CRITICAL">,
  "scam_type": <string: short category name, e.g., "Electricity Bill Fraud", "KYC Update Phishing">,
  "explanation": <string: 1-2 sentences explaining why this is suspicious based on Indian context>,
  "recommended_action": <string: 1 sentence on what the user should do>
}}
Do NOT wrap the output in markdown blocks like ```json. Return ONLY the raw JSON object.
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up in case Gemini accidentally wraps in markdown
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "", 1)
        if response_text.endswith("```"):
            response_text = response_text[:response_text.rfind("```")]
            
        result = json.loads(response_text.strip())
        return result
    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "threat_score": 50,
            "verdict": "UNKNOWN",
            "scam_type": "Analysis Failed",
            "explanation": f"LLM parsing error: {str(e)}",
            "recommended_action": "Avoid interacting with the message until verified."
        }
