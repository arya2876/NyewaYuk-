# 🔧 Panduan Setup n8n untuk NyewaYuk

## 📋 Overview Workflow Anda

Berdasarkan screenshot, Anda punya 2 workflow:
1. **Image Analyzer** - Untuk NyewaGuard AI scan
2. **PDF Extractor & Analyzer** - Untuk analisis dokumen

---

## ✅ Setup 1: Webhook Node (NyewaGuard Scan)

### Konfigurasi Webhook

**Path:** `nyewaguard-scan` (sudah benar di screenshot)

**Full URL akan jadi:**
```
https://arzwin.app.n8n.cloud/webhook-test/nyewaguard-scan
```

**HTTP Method:** `POST` ✅

**Authentication:** `None` (atau gunakan Bearer Token - recommended)

### Response Data Template

Ganti default response dengan:

```json
{
  "success": true,
  "verified": {{ $json.verified }},
  "score": {{ $json.score }},
  "damages": {{ $json.damages }},
  "summary": "{{ $json.summary }}",
  "timestamp": "{{ $now }}"
}
```

### Expected Input dari Web

Webhook akan menerima JSON ini dari `verifyConditionViaN8n()`:

```json
{
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "itemId": "67512a1b2c3d4e5f6a7b8c9d",
  "itemTitle": "Kamera Canon EOS 5D",
  "checkType": "initial"
}
```

---

## ✅ Setup 2: Filter by Type Node

**Tujuan:** Memisahkan request berdasarkan tipe (image vs PDF)

### Konfigurasi

**Condition 1 (Route ke Image Analyzer):**
```
Property: {{ $json.imageUrl }}
Operator: Is defined
```

**Condition 2 (Route ke PDF Analyzer):**
```
Property: {{ $json.pdfUrl }}
Operator: Is defined
```

---

## ✅ Setup 3: HTTP Request - Download Image

### Parameters

**Method:** `GET`

**URL:**
```
{{ $json.imageUrl }}
```

**Response Format:** `File` ✅ (PENTING!)

**Options:**
- ✅ Enable "Download Binary"
- Binary Property Name: `data`

### Testing

Test dengan URL ini:
```
https://res.cloudinary.com/demo/image/upload/sample.jpg
```

Output harus berupa binary file yang bisa diteruskan ke AI node.

---

## ✅ Setup 4: Analyze an Image Node

Ini adalah **AI Vision node** - ada beberapa pilihan:

### Option A: OpenAI Vision (Recommended)

**Node Type:** `OpenAI Chat Model`

**API Key:** 
- Buat di https://platform.openai.com/api-keys
- Masukkan di Credentials: `sk-proj-xxxxx`

**Model:** `gpt-4-vision-preview` atau `gpt-4o`

**Prompt untuk Analyzer Agent:**
```
Analyze this image for rental item condition verification.

Item: {{ $json.itemTitle }}
Check Type: {{ $json.checkType }}

Provide analysis in JSON format:
{
  "verified": true/false,
  "score": 0-100,
  "damages": ["list of damages found"],
  "summary": "brief condition description",
  "recommendation": "approve/reject/review"
}

Focus on:
1. Physical damage (scratches, dents, cracks)
2. Cleanliness and maintenance
3. Functional appearance
4. Safety concerns
```

**Image Input:**
```
{{ $binary.data }}
```

### Option B: Replicate (Alternative)

**Node Type:** `HTTP Request` to Replicate API

**URL:**
```
https://api.replicate.com/v1/predictions
```

**Headers:**
```
Authorization: Token YOUR_REPLICATE_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "version": "salesforce/blip",
  "input": {
    "image": "{{ $binary.data.toString('base64') }}",
    "task": "visual_question_answering",
    "question": "Describe the condition of this item. Any damage or issues?"
  }
}
```

### Option C: Roboflow (Computer Vision)

**Node Type:** `HTTP Request`

**URL:**
```
https://detect.roboflow.com/YOUR-MODEL/1?api_key=YOUR_KEY
```

**Method:** `POST`

**Body Type:** `Binary`

**Binary Data:** `{{ $binary.data }}`

---

## ✅ Setup 5: Analyzer Agent (Chat Model)

Ini adalah **OpenRouter Chat Model** di screenshot Anda.

### Konfigurasi

**Base URL:**
```
https://openrouter.ai/api/v1/chat/completions
```

**API Key:**
- Daftar di https://openrouter.ai/keys
- Masukkan di Credentials

**Model:** Pilih salah satu:
- `openai/gpt-4o` - Best accuracy
- `anthropic/claude-3-sonnet` - Balance
- `google/gemini-pro-vision` - Budget friendly

**System Prompt:**
```
You are an expert rental item inspector. Analyze the AI vision results and provide a final verification decision.

Return ONLY valid JSON:
{
  "verified": boolean,
  "score": number (0-100),
  "damages": string[],
  "summary": string,
  "recommendation": "approve" | "reject" | "manual_review"
}
```

**User Message:**
```
Item: {{ $('Webhook').item.json.itemTitle }}
AI Analysis: {{ $json.analysis }}
Check Type: {{ $('Webhook').item.json.checkType }}

Make final decision.
```

---

## ✅ Respond to Webhook: Cara Mengisi Response Data

Agar caller (web/app) mendapat jawaban langsung, tambahkan node **Respond to Webhook** di akhir alur AI dan isi field berikut:

**Konfigurasi Utama**
- Response Mode: `Respond to Webhook`
- Response Format: `JSON`
- Header: `Content-Type: application/json`

**Response Body (JSON)**
Gunakan salah satu dari dua cara berikut, tergantung node terakhir Anda:

1) Jika node terakhir adalah Analyze/Chat yang sudah menghasilkan objek JSON di `$json`:
```json
{
  "success": true,
  "verified": {{ $json.verified }},
  "score": {{ $json.score }},
  "damages": {{ $json.damages }},
  "summary": "{{ $json.summary }}",
  "recommendation": "{{ $json.recommendation }}",
  "timestamp": "{{ $now }}"
}
```

2) Jika output AI berupa teks dan Anda ingin memetakan manual dari beberapa node:
```json
{
  "success": true,
  "verified": {{ $('Analyzer Agent').item.json.verified || $json.verified }},
  "score": {{ $('Analyzer Agent').item.json.score || $json.score }},
  "damages": {{ $('Analyzer Agent').item.json.damages || $json.damages || [] }},
  "summary": "{{ $('Analyzer Agent').item.json.summary || $json.summary || 'Analisis selesai' }}",
  "recommendation": "{{ $('Analyzer Agent').item.json.recommendation || $json.recommendation || 'manual_review' }}",
  "itemTitle": "{{ $('Webhook').item.json.itemTitle }}",
  "checkType": "{{ $('Webhook').item.json.checkType }}",
  "timestamp": "{{ $now }}"
}
```

Tips:
- Pastikan node `Respond to Webhook` tersambung dari node terakhir (Analyze → Analyzer Agent → Respond).
- Jika muncul pesan "Problem running workflow – resolve outstanding issues": buka setiap node yang ada tanda ⚠️, isi credential/API key, dan test node satu per satu sampai semua hijau.
- Untuk Test URL, klik "Listen for test event" di node Webhook sebelum mengirim request; untuk Production gunakan path `…/webhook/...` setelah workflow di-Activate.

### Memory & Tools

**Chat Model:** Pilih yang sudah dikonfigurasi di atas

**Memory:** Optional - untuk multi-turn conversation

**Tools:** Tidak perlu untuk verification task ini

---

## 🔒 Setup Authentication (Recommended)

### Di n8n Webhook:

**Authentication:** `Header Auth`

**Header Name:** `Authorization`

**Header Value:** `Bearer YOUR_SECRET_TOKEN`

### Di Web (.env):

```env
N8N_NYEWAGUARD_WEBHOOK_URL=https://arzwin.app.n8n.cloud/webhook/nyewaguard-scan
N8N_TOKEN=YOUR_SECRET_TOKEN
```

### Di n8nActions.ts:

Sudah ada - tidak perlu ubah:
```typescript
headers: {
  'Authorization': `Bearer ${N8N_TOKEN}`,
}
```

---

## 🧪 Testing Workflow

### Step 1: Test Webhook

Click **"Listen for test event"** di n8n, lalu kirim curl:

```bash
curl -X POST https://arzwin.app.n8n.cloud/webhook-test/nyewaguard-scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN" \
  -d '{
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "itemId": "test123",
    "itemTitle": "Test Camera",
    "checkType": "initial"
  }'
```

### Step 2: Check Each Node

Klik setiap node untuk lihat output:
1. **Webhook** → Harus terima JSON
2. **Filter** → Route ke Image path
3. **HTTP Request** → Download image sebagai binary
4. **Analyze Image** → AI vision result
5. **Analyzer Agent** → Final JSON decision

### Step 3: Test dari Web

```typescript
// Di browser console (halaman listing detail)
const result = await fetch('/api/webhooks/n8n/nyewaguard', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    itemId: '123',
    itemTitle: 'Test Item'
  })
});

console.log(await result.json());
```

---

## 📝 Checklist Setup

### 1. Credentials
- [ ] OpenAI API Key (untuk Vision & Chat)
- [ ] OpenRouter API Key (alternatif)
- [ ] n8n Webhook Token (untuk auth)

### 2. Webhook Configuration
- [ ] Path: `nyewaguard-scan`
- [ ] Method: POST
- [ ] Authentication: Bearer Token
- [ ] Response Mode: "When Last Node Finishes"

### 3. HTTP Request Node
- [ ] URL: `{{ $json.imageUrl }}`
- [ ] Response Format: **File**
- [ ] Binary Property: `data`

### 4. AI Vision Node
- [ ] Model: gpt-4-vision atau equivalent
- [ ] Image Input: `{{ $binary.data }}`
- [ ] Prompt: Inspection instructions (lihat di atas)

### 5. Analyzer Agent
- [ ] Chat Model: Connected
- [ ] System Prompt: Inspector role
- [ ] Output: Valid JSON only

### 6. Environment Variables
- [ ] `N8N_NYEWAGUARD_WEBHOOK_URL` di .env web
- [ ] `N8N_TOKEN` di .env web

### 7. Testing
- [ ] Test dengan curl
- [ ] Test dari web console
- [ ] Verify JSON response format

---

## 🚨 Common Issues & Solutions

### Issue 1: "No binary data found"
**Problem:** HTTP Request tidak download image sebagai binary

**Fix:**
- Set Response Format: `File` (bukan JSON/Text)
- Enable "Download Binary"
- Check URL valid dan accessible

### Issue 2: AI Vision error
**Problem:** Model tidak bisa process binary

**Fix:**
```javascript
// Di Code node sebelum AI:
const base64 = $binary.data.toString('base64');
return [{ json: { image: base64 } }];
```

### Issue 3: Invalid JSON response
**Problem:** AI return text alih-alih JSON

**Fix:** Update prompt:
```
CRITICAL: Return ONLY valid JSON. No markdown, no explanation.
Start with { and end with }
```

### Issue 4: Webhook timeout
**Problem:** AI processing terlalu lama

**Fix:**
- Di Webhook Settings → Response Mode: "Using Respond to Webhook Node"
- Tambahkan "Respond to Webhook" node di akhir
- Set timeout lebih tinggi (60s)

---

## 🎯 Production Checklist

### Before Deploy:
- [ ] Ganti Test URL ke Production URL
- [ ] Enable Authentication (Bearer Token)
- [ ] Set proper error handling di setiap node
- [ ] Add logging/monitoring
- [ ] Test dengan berbagai jenis gambar:
  - [ ] High quality (5MB+)
  - [ ] Low quality
  - [ ] Invalid URL
  - [ ] Non-image URL

### After Deploy:
- [ ] Monitor n8n execution logs
- [ ] Check response times (harus < 10s)
- [ ] Verify JSON format consistency
- [ ] Test dari production web

---

## 📊 Expected Response Format

### Success Response:
```json
{
  "success": true,
  "verified": true,
  "score": 85,
  "damages": [],
  "summary": "Item dalam kondisi baik, tidak ada kerusakan terlihat",
  "recommendation": "approve",
  "timestamp": "2025-12-05T10:30:00Z"
}
```

### Rejection Response:
```json
{
  "success": true,
  "verified": false,
  "score": 45,
  "damages": [
    "Scratches on lens",
    "Dent on camera body",
    "Missing lens cap"
  ],
  "summary": "Item memiliki beberapa kerusakan yang perlu perhatian",
  "recommendation": "reject",
  "timestamp": "2025-12-05T10:30:00Z"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Failed to download image",
  "message": "URL tidak valid atau gambar tidak dapat diakses"
}
```

---

## 🔗 Update Web Integration

Setelah n8n setup, update URL di `.env`:

```env
# n8n Webhooks
N8N_NYEWAGUARD_WEBHOOK_URL=https://arzwin.app.n8n.cloud/webhook/nyewaguard-scan
N8N_TOKEN=your-secret-token-here

# Optional: Separate URL untuk production
N8N_CHECKOUT_WEBHOOK_URL=https://arzwin.app.n8n.cloud/webhook/checkout
```

Webhook URL Anda yang benar dari screenshot:
```
https://arzwin.app.n8n.cloud/webhook-test/nyewaguard-scan
```

Untuk production, ubah `-test` menjadi path biasa.

---

## 📞 Support Resources

- **n8n Docs:** https://docs.n8n.io/
- **OpenAI Vision:** https://platform.openai.com/docs/guides/vision
- **OpenRouter:** https://openrouter.ai/docs
- **Replicate:** https://replicate.com/docs

Butuh bantuan? Share error message atau screenshot node yang bermasalah.
