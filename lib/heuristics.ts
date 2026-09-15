export interface HeuristicBreakdown {
  score: number;
  flags: string[];
  detectedBrand?: string;
  isHighConfidenceScam: boolean;
}

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.buzz', '.club', '.online', '.site', '.vip', '.work', '.click', '.cc'];

const INDIAN_FINANCIAL_NAMESPACES = [
  { name: 'State Bank of India', pattern: /sbi/i, legitimate: 'sbi.co.in' },
  { name: 'HDFC Bank', pattern: /hdfc/i, legitimate: 'hdfcbank.com' },
  { name: 'ICICI Bank', pattern: /icici/i, legitimate: 'icicibank.com' },
  { name: 'Punjab National Bank', pattern: /pnb/i, legitimate: 'pnbindia.in' },
  { name: 'Axis Bank', pattern: /axis/i, legitimate: 'axisbank.com' },
  { name: 'Paytm Payments Bank', pattern: /paytm/i, legitimate: 'paytmbank.com' }
];

const URGENCY_TRIGGERS = [
  { regex: /blocked\s+(today|within|immediately|in\s+\d+\s*(mins?|hours?))/i, weight: 25, desc: 'Imminent deactivation or legal penalty threat' },
  { regex: /kyc\s+(suspended|pending|incomplete|failed)/i, weight: 25, desc: 'Coercive KYC deactivation pressure' },
  { regex: /electricity.*(disconnect|cut\s*off|power\s*cut)/i, weight: 30, desc: 'Immediate utility disconnection ultimatum' },
  { regex: /(lottery|gift\s*card|selected\s*for|won\s+a\s+prize)/i, weight: 20, desc: 'Unsolicited lottery reward manipulation' },
  { regex: /(part-time|work\s*from\s*home|daily\s*income).*telegram/i, weight: 25, desc: 'Task-trapping / Telegram work exploitation' }
];

export function runHeuristicAudit(text: string, rawUrl?: string): HeuristicBreakdown {
  let score = 0;
  const flags: string[] = [];
  let detectedBrand: string | undefined = undefined;

  for (const trigger of URGENCY_TRIGGERS) {
    if (trigger.regex.test(text)) {
      score += trigger.weight;
      flags.push(trigger.desc);
    }
  }

  if (/(enter|verify|share|update).*(otp|pin|password|cvv|aadhaar|pan\s*card)/i.test(text)) {
    score += 30;
    flags.push('Unauthorized solicitation of confidential banking credentials (OTP/PIN/CVV)');
  }

  if (rawUrl) {
    try {
      const sanitized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      const host = new URL(sanitized).hostname.toLowerCase();

      if (SUSPICIOUS_TLDS.some(tld => host.endsWith(tld))) {
        score += 25;
        flags.push(`Suspicious low-cost top-level domain: .${host.split('.').pop()}`);
      }

      for (const brand of INDIAN_FINANCIAL_NAMESPACES) {
        if (brand.pattern.test(host) && !host.endsWith(brand.legitimate)) {
          score += 40;
          detectedBrand = brand.name;
          flags.push(`Lookalike impersonation of ${brand.name} detected on unauthorized host (${host})`);
        }
      }
    } catch {
      score += 10;
      flags.push('Obfuscated or malformed web address structure');
    }
  }

  const capped = Math.min(score, 65);
  return {
    score: capped,
    flags,
    detectedBrand,
    isHighConfidenceScam: capped >= 40
  };
}
