import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const response = await fetch(`${BACKEND_URL}/api/analyze/audio`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Audio Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze audio' },
      { status: 500 }
    );
  }
}
