export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  'https://scam-shield-9w1h.onrender.com'
).replace(/\/$/, '');
