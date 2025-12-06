# n8n Integration Workflows for NyewaYuk

This document describes the n8n workflows needed to handle checkout processing, payment notifications, and NyewaGuard AI verification.

## Overview

NyewaYuk uses n8n as the orchestration layer for:
1. **Checkout & Payment Processing** - Handle booking confirmations and WhatsApp notifications
2. **NyewaGuard AI Verification** - Automated item condition verification using computer vision

## Required n8n Workflows

### 1. Checkout & Payment Processing Workflow

**Webhook URL**: `https://your-n8n-host/webhook/nyewayuk-checkout`

**Purpose**: Process checkout requests, send WhatsApp payment instructions, and handle payment confirmations.

**Workflow Steps**:

1. **Webhook Trigger** (Webhook node)
   - Path: `/nyewayuk-checkout`
   - Method: POST
   - Authentication: Bearer token (optional)

2. **Extract Checkout Data** (Set node)
   - Extract fields: userId, itemId, itemTitle, totalPrice, userName, userPhone, etc.

3. **Create Order Record** (HTTP Request node - Optional)
   - POST to `https://your-app.vercel.app/api/orders`
   - Body: Order details
   - Store orderId for reference

4. **Format WhatsApp Message** (Function node)
   ```javascript
   const data = $json.data;
   const message = `🎉 Pesanan Baru!\n\n` +
     `Halo ${data.user.name}!\n\n` +
     `Terima kasih telah menyewa: *${data.itemTitle}*\n\n` +
     `📅 Tanggal: ${new Date(data.startDate).toLocaleDateString('id-ID')} - ${new Date(data.endDate).toLocaleDateString('id-ID')}\n\n` +
     `💰 Rincian Biaya:\n` +
     `- Biaya Sewa: Rp ${data.totalPrice.toLocaleString('id-ID')}\n` +
     `- Biaya Layanan: Rp ${data.serviceFee.toLocaleString('id-ID')}\n` +
     `- Deposit: Rp ${data.depositAmount.toLocaleString('id-ID')}\n` +
     `- Logistik (${data.logisticsMethod}): Rp ${data.logisticsFee.toLocaleString('id-ID')}\n\n` +
     `📌 Total: *Rp ${(data.totalPrice + data.serviceFee + data.depositAmount + data.logisticsFee).toLocaleString('id-ID')}*\n\n` +
     `💳 Transfer ke: ${data.paymentInfo}\n\n` +
     `📋 Syarat & Ketentuan: ${data.termsUrl}\n\n` +
     `Kirim bukti transfer untuk konfirmasi!`;
   
   return { message, phone: data.user.phone };
   ```

5. **Send WhatsApp** (HTTP Request node)
   - URL: `https://graph.facebook.com/v19.0/{{WA_PHONE_ID}}/messages`
   - Method: POST
   - Headers:
     - `Authorization: Bearer {{WA_ACCESS_TOKEN}}`
     - `Content-Type: application/json`
   - Body:
     ```json
     {
       "messaging_product": "whatsapp",
       "to": "{{$json.phone}}",
       "type": "text",
       "text": {
         "preview_url": false,
         "body": "{{$json.message}}"
       }
     }
     ```

6. **Wait for Payment** (Wait node - Optional)
   - Wait for incoming webhook or manual confirmation
   - Timeout: 24 hours

7. **Send Confirmation** (HTTP Request node)
   - On payment received, send confirmation WhatsApp
   - Update order status to PAID

8. **Notify Owner** (HTTP Request node)
   - Send WhatsApp to item owner
   - Include renter details and booking dates

**Response Format**:
```json
{
  "ok": true,
  "orderId": "...",
  "message": "Checkout processed successfully"
}
```

---

### 2. NyewaGuard AI Verification Workflow

**Webhook URL**: `https://your-n8n-host/webhook/nyewayuk-nyewaguard`

**Purpose**: Analyze item condition photos using AI/CV models and return verification results.

**Workflow Steps**:

1. **Webhook Trigger** (Webhook node)
   - Path: `/nyewayuk-nyewaguard`
   - Method: POST
   - Authentication: Bearer token (optional)

2. **Extract Verification Data** (Set node)
   - Extract: images[], itemId, itemTitle, verificationType

3. **Process Each Image** (Loop node)
   - Iterate through images array

4. **AI Image Analysis** (HTTP Request node)
   - **Option A**: Use Replicate API (e.g., BLIP-2 for image captioning)
     - URL: `https://api.replicate.com/v1/predictions`
     - Model: `salesforce/blip-2`
   
   - **Option B**: Use Roboflow (object detection/damage detection)
     - URL: `https://detect.roboflow.com/[your-model-id]`
   
   - **Option C**: Use OpenAI Vision API
     - URL: `https://api.openai.com/v1/chat/completions`
     - Model: `gpt-4-vision-preview`
     - Prompt: "Analyze this item photo. List any damages, scratches, or defects. Rate condition 1-10."

5. **Aggregate Results** (Aggregate node)
   - Collect all image analysis results
   - Calculate average condition score

6. **Generate Verification Report** (Function node)
   ```javascript
   const results = $json.results;
   const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
   
   const damages = results.flatMap(r => r.damages || []);
   const verified = avgScore >= 7 && damages.length === 0;
   
   return {
     verified,
     score: Math.round(avgScore * 10),
     damages: damages,
     summary: verified 
       ? `Item in good condition (${Math.round(avgScore * 10)}/100)` 
       : `Issues detected: ${damages.join(', ')}`,
     analyzedImages: results.length,
     timestamp: Date.now()
   };
   ```

7. **Store Verification** (HTTP Request node - Optional)
   - POST verification result back to your app
   - URL: `https://your-app.vercel.app/api/items/{{itemId}}/verification`

8. **Response** (Respond to Webhook node)
   - Return verification result

**Response Format**:
```json
{
  "ok": true,
  "verification": {
    "verified": true,
    "score": 85,
    "damages": [],
    "summary": "Item in good condition (85/100)",
    "analyzedImages": 3,
    "timestamp": 1701800000000
  }
}
```

---

### 3. Payment Confirmation Workflow (Optional)

**Webhook URL**: `https://your-n8n-host/webhook/nyewayuk-payment-confirm`

**Purpose**: Handle manual or automated payment confirmations.

**Workflow Steps**:

1. **Webhook Trigger**
   - Receive: orderId, amount, reference, paymentProof (image URL)

2. **Verify Payment** (Function/IF node)
   - Check amount matches order total
   - Optional: OCR on payment proof image

3. **Update Order Status** (HTTP Request)
   - POST to your app: `/api/payments/confirm`

4. **Send WhatsApp Confirmation**
   - Notify buyer: payment received
   - Notify owner: prepare item for pickup/delivery

---

## Environment Variables for n8n

Configure these in your n8n instance:

```bash
# WhatsApp Cloud API
WA_ACCESS_TOKEN=your_whatsapp_access_token
WA_PHONE_ID=your_phone_number_id

# AI/CV Services (choose one or more)
REPLICATE_API_TOKEN=your_replicate_token
ROBOFLOW_API_KEY=your_roboflow_key
OPENAI_API_KEY=your_openai_key

# App Integration
APP_BASE_URL=https://your-app.vercel.app
APP_API_KEY=your_api_key_for_callbacks
```

---

## Setup Instructions

### 1. Import Workflows to n8n

1. Copy the workflow JSON files (see below) to your n8n instance
2. Go to n8n → Workflows → Import from File
3. Configure credentials for WhatsApp, AI services, etc.
4. Activate workflows

### 2. Configure Environment Variables in Your App

Add to `.env`:
```bash
N8N_CHECKOUT_WEBHOOK_URL=https://your-n8n-host/webhook/nyewayuk-checkout
N8N_NYEWAGUARD_WEBHOOK_URL=https://your-n8n-host/webhook/nyewayuk-nyewaguard
N8N_TOKEN=your_bearer_token_if_needed
```

### 3. Test Workflows

**Test Checkout**:
```bash
curl -X POST https://your-n8n-host/webhook/nyewayuk-checkout \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout",
    "data": {
      "userId": "test-user",
      "itemId": "test-item",
      "itemTitle": "Kamera Canon EOS",
      "totalPrice": 100000,
      "user": { "name": "John", "phone": "6281234567890" }
    }
  }'
```

**Test NyewaGuard**:
```bash
curl -X POST https://your-n8n-host/webhook/nyewayuk-nyewaguard \
  -H "Content-Type: application/json" \
  -d '{
    "images": ["https://example.com/image1.jpg"],
    "itemId": "test-item",
    "verificationType": "initial"
  }'
```

---

## n8n Workflow JSON Templates

### Checkout Workflow (Basic Template)

```json
{
  "name": "NyewaYuk - Checkout Processing",
  "nodes": [
    {
      "parameters": {
        "path": "nyewayuk-checkout",
        "options": {}
      },
      "id": "webhook-checkout",
      "name": "Webhook Checkout",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 200]
    },
    {
      "parameters": {
        "url": "https://graph.facebook.com/v19.0/={{$env.WA_PHONE_ID}}/messages",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "options": {},
        "bodyParametersJson": "={{ {\n  \"messaging_product\": \"whatsapp\",\n  \"to\": $json.data.user.phone,\n  \"type\": \"text\",\n  \"text\": {\n    \"body\": `Halo ${$json.data.user.name}! Pesanan ${$json.data.itemTitle} berhasil. Total: Rp ${$json.data.totalPrice}`\n  }\n} }}"
      },
      "id": "send-wa",
      "name": "Send WhatsApp",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [460, 200]
    }
  ],
  "connections": {
    "Webhook Checkout": {
      "main": [[{ "node": "Send WhatsApp", "type": "main", "index": 0 }]]
    }
  }
}
```

### NyewaGuard Workflow (Basic Template)

```json
{
  "name": "NyewaYuk - NyewaGuard AI",
  "nodes": [
    {
      "parameters": {
        "path": "nyewayuk-nyewaguard",
        "options": {}
      },
      "id": "webhook-guard",
      "name": "Webhook NyewaGuard",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 200]
    },
    {
      "parameters": {
        "jsCode": "const verified = true;\nconst score = 85;\nreturn { verified, score, damages: [], summary: 'Good condition' };"
      },
      "id": "analyze-mock",
      "name": "AI Analysis (Mock)",
      "type": "n8n-nodes-base.code",
      "typeVersion": 1,
      "position": [460, 200]
    }
  ],
  "connections": {
    "Webhook NyewaGuard": {
      "main": [[{ "node": "AI Analysis (Mock)", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## Advanced Features

### Payment Gateway Integration

Add nodes to integrate with Midtrans, Xendit, or other payment gateways:
- Receive webhook from payment gateway
- Verify signature
- Update order status
- Trigger confirmation flow

### Automated Reminders

Use **Schedule Trigger** node:
- Check for unpaid orders > 4 hours old
- Send reminder WhatsApp
- Escalate to admin if > 24 hours

### Analytics & Reporting

- Log all transactions to Google Sheets
- Send daily summary to admin WhatsApp/Email
- Track conversion rates, average order value, etc.

---

## Security Best Practices

1. **Use Bearer Tokens**: Add `N8N_TOKEN` to authenticate webhook calls
2. **Validate Signatures**: Verify HMAC signatures on incoming webhooks
3. **Rate Limiting**: Configure rate limits on n8n webhooks
4. **IP Whitelisting**: Restrict webhook access to your Vercel IPs
5. **Secrets Management**: Store all tokens in n8n credentials, never in workflow JSON

---

## Support & Resources

- n8n Documentation: https://docs.n8n.io
- WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Replicate AI Models: https://replicate.com/explore
- OpenAI Vision API: https://platform.openai.com/docs/guides/vision

---

## Troubleshooting

**Issue**: Webhook not receiving requests
- Check n8n URL is publicly accessible
- Verify webhook path matches configuration
- Check firewall/security group settings

**Issue**: WhatsApp messages not sending
- Verify WA_ACCESS_TOKEN and WA_PHONE_ID
- Check phone number format (must start with country code, no +)
- Ensure recipient has opted in during development

**Issue**: AI verification fails
- Check API keys for AI services
- Verify image URLs are publicly accessible
- Review AI service rate limits and quotas

---

For implementation help, contact your development team or see the n8n community forum.
