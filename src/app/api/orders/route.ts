// This route has been replaced by n8n webhook integration
// See: /api/webhooks/n8n/checkout
// See: src/app/actions/n8nActions.ts (createBookingViaN8n)

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use n8n checkout webhook instead." },
    { status: 410 }
  );
}
