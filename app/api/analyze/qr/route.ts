import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Forward the formData to the Python backend
    const response = await fetch(`${BACKEND_URL}/api/analyze/qr`, {
      method: 'POST',
      body: formData,
      // Note: Do not set Content-Type manually when passing FormData
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('QR Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze QR code' },
      { status: 500 }
    );
  }
}
