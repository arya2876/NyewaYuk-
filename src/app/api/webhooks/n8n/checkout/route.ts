import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, 
      itemId, 
      itemTitle, 
      startDate, 
      endDate, 
      totalPrice, 
      serviceFee, 
      depositAmount, 
      logisticsMethod, 
      logisticsFee,
      userName,
      userPhone,
      userEmail 
    } = body || {};

    // Validate required fields
    const missing: string[] = [];
    if (!userId) missing.push("userId");
    if (!itemId) missing.push("itemId");
    if (!itemTitle) missing.push("itemTitle");
    if (!totalPrice) missing.push("totalPrice");
    if (!userPhone) missing.push("userPhone");
    
    if (missing.length) {
      return NextResponse.json({ error: `Missing: ${missing.join(", ")}` }, { status: 400 });
    }

    const n8nUrl = process.env.N8N_CHECKOUT_WEBHOOK_URL;
    const n8nToken = process.env.N8N_TOKEN;

    if (!n8nUrl) {
      return NextResponse.json({ error: "N8N_CHECKOUT_WEBHOOK_URL not configured" }, { status: 500 });
    }

    // Prepare payload for n8n
    const payload = {
      type: "checkout",
      data: {
        userId,
        itemId,
        itemTitle,
        startDate,
        endDate,
        totalPrice,
        serviceFee: serviceFee || 0,
        depositAmount: depositAmount || 0,
        logisticsMethod: logisticsMethod || "Self-Pickup",
        logisticsFee: logisticsFee || 0,
        user: {
          name: userName || "Pengguna",
          phone: userPhone,
          email: userEmail || "",
        },
        paymentInfo: process.env.PAYMENT_ACCOUNT_INFO || "BCA 123456 a.n NyewaYuk",
        termsUrl: process.env.TERMS_URL || "https://example.com/terms",
      },
      timestamp: Date.now(),
    };

    // Send to n8n
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
      return NextResponse.json({ error: data?.error || "n8n checkout failed" }, { status: 502 });
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Checkout processed via n8n",
      n8nResponse: data 
    }, { status: 202 });

  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Checkout webhook failed" }, { status: 500 });
  }
}
