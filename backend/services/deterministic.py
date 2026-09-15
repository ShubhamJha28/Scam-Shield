import re
from typing import Dict, Any, Tuple

# Suspicious TLDs
SUSPICIOUS_TLDS = ['.top', '.xyz', '.buzz', '.shop', '.club', '.online']

# Known Indian bank domains
KNOWN_BANKS = ['sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'pnbindia.in']

# Urgent patterns
URGENT_PATTERNS = [
    r'electricity\s*disconnected',
    r'kyc\s*suspended',
    r'block\s*your\s*account',
    r'urgent\s*verification'
]

def analyze_text(text: str) -> Tuple[bool, Dict[str, Any]]:
    """
    Stage 1: Deterministic Engine
    Runs fast regex and pattern matching to flag obvious threats.
    Returns (is_conclusive, result_dict)
    """
    text_lower = text.lower()
    
    # 1. Check for urgency cues
    for pattern in URGENT_PATTERNS:
        if re.search(pattern, text_lower):
            return True, {
                "threat_score": 85,
                "verdict": "HIGH_RISK",
                "scam_type": "Phishing / Coercion",
                "explanation": f"Message contains high-urgency coercion trigger: '{pattern}'",
                "recommended_action": "Do not click links or call numbers provided. Verify independently."
            }
            
    # 2. Check for suspicious TLDs if a URL is present
    url_pattern = r'https?://[^\s]+'
    urls = re.findall(url_pattern, text_lower)
    for url in urls:
        if any(url.endswith(tld) or (tld + '/') in url for tld in SUSPICIOUS_TLDS):
            return True, {
                "threat_score": 90,
                "verdict": "CRITICAL_RISK",
                "scam_type": "Malicious URL",
                "explanation": f"URL {url} uses a TLD commonly associated with throwaway phishing campaigns.",
                "recommended_action": "Do not open the link."
            }
            
    # If no obvious patterns are hit, return inconclusive to trigger Stage 2 (LLM)
    return False, {
        "threat_score": 0,
        "verdict": "INCONCLUSIVE",
        "explanation": "No deterministic rules triggered."
    }
