import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      images,
      itemId,
      itemTitle,
      verificationType, // "initial" or "return"
      userId,
      bookingId
    } = body || {};

    // Validate required fields
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "Images required" }, { status: 400 });
    }

    if (!itemId || !verificationType) {
      return NextResponse.json({ error: "Missing itemId or verificationType" }, { status: 400 });
    }

    const n8nUrl = process.env.N8N_NYEWAGUARD_WEBHOOK_URL;
    const n8nToken = process.env.N8N_TOKEN;

    if (!n8nUrl) {
      return NextResponse.json({ error: "N8N_NYEWAGUARD_WEBHOOK_URL not configured" }, { status: 500 });
    }

    // Prepare payload for n8n AI verification
    const payload = {
      type: "nyewaguard_verification",
      data: {
        itemId,
        itemTitle: itemTitle || "Unknown Item",
        images,
        verificationType, // "initial" (saat publish) atau "return" (saat pengembalian)
        userId,
        bookingId: bookingId || null,
        timestamp: Date.now(),
      },
    };

    // Send to n8n for AI processing
    const res = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(n8nToken ? { Authorization: `Bearer ${n8nToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      return NextResponse.json({ error: data?.error || "n8n NyewaGuard verification failed" }, { status: 502 });
    }

    // Return AI verification result from n8n
    // Expected response format:
    // {
    //   verified: true/false,
    //   score: 0-100,
    //   damages: [...],
    //   summary: "..."
    // }
    return NextResponse.json({ 
      ok: true, 
      verification: data,
      message: "NyewaGuard verification completed"
    }, { status: 200 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message || "NyewaGuard webhook failed" }, { status: 500 });
  }
}
