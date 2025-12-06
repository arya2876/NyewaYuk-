// This route has been replaced by n8n webhook integration
// Payment confirmations now handled via n8n workflows
// See: N8N_INTEGRATION.md for payment webhook setup

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use n8n payment webhook instead." },
    { status: 410 }
  );
}
