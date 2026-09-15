import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:8000/api/threats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Avoid caching so the feed is always live
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Threats Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threats feed' },
      { status: 500 }
    );
  }
}
