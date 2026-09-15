import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    // Route to the FastAPI Python Backend
    const backendRes = await fetch("http://localhost:8000/api/analyze/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Backend analysis failed" }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Analysis route error:", error);
    return NextResponse.json({ error: "Internal Server Error - Python backend unreachable" }, { status: 500 });
  }
}
