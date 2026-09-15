import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const response = await fetch(`${BACKEND_URL}/api/emergency/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Emergency Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
