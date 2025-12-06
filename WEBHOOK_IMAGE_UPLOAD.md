# Cara Mengirim Gambar ke Webhook n8n

## ✅ Metode 1: Kirim URL Gambar (Current Implementation)

**Status:** Sudah diimplementasikan di `ListingClient.tsx` dan `n8nActions.ts`

### Flow:
```
User → CldUploadWidget → Cloudinary → Get URL → Send URL to n8n → n8n downloads image
```

### Kode (sudah ada):
```typescript
// ListingClient.tsx
const handleAiScan = async (imageUrl: string) => {
  const result = await verifyConditionViaN8n({
    imageUrl: imageUrl, // URL publik dari Cloudinary
    itemId: listingId,
    itemTitle: listing.title
  });
};
```

### n8n Workflow (untuk URL):
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "nyewaguard",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "HTTP Request - Download Image",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{ $json.imageUrl }}",
        "responseFormat": "file"
      }
    },
    {
      "name": "AI Vision Analysis",
      "type": "@n8n/n8n-nodes-langchain.aiVisionChatOpenAi",
      "parameters": {
        "imageInput": "={{ $binary.data }}"
      }
    }
  ]
}
```

**Keuntungan:**
- ✅ Simple, tidak perlu handle file upload di server
- ✅ Bandwidth efficient (hanya kirim URL)
- ✅ Cloudinary handle CDN dan caching
- ✅ n8n bisa retry download jika gagal

---

## 🆕 Metode 2: Kirim File Binary Langsung (Alternative)

**Gunakan jika:** Gambar belum ada di Cloudinary, atau ingin langsung kirim dari client

### A. Client-Side Upload dengan FormData

```typescript
// Example: Upload file binary ke n8n
const handleDirectImageUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('itemId', listingId);
  formData.append('itemTitle', listing.title);
  formData.append('checkType', 'initial');

  const response = await fetch('/api/webhooks/n8n/nyewaguard-binary', {
    method: 'POST',
    body: formData, // Kirim sebagai multipart/form-data
  });

  const result = await response.json();
  return result;
};
```

### B. Server Route untuk Forward Binary

```typescript
// src/app/api/webhooks/n8n/nyewaguard-binary/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create FormData untuk n8n
    const n8nFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    n8nFormData.append('file', blob, file.name);
    n8nFormData.append('itemId', formData.get('itemId') as string);
    n8nFormData.append('itemTitle', formData.get('itemTitle') as string);

    // Forward ke n8n
    const response = await fetch(process.env.N8N_NYEWAGUARD_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.N8N_TOKEN}`,
      },
      body: n8nFormData,
    });

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error forwarding image to n8n:', error);
    return NextResponse.json(
      { error: 'Failed to process image' }, 
      { status: 500 }
    );
  }
}
```

### C. n8n Workflow untuk Binary File

```json
{
  "nodes": [
    {
      "name": "Webhook - Receive Binary",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "nyewaguard-binary",
        "responseMode": "responseNode",
        "options": {
          "rawBody": false
        }
      }
    },
    {
      "name": "Extract File from FormData",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// File sudah ada di $binary.file\nreturn items;"
      }
    },
    {
      "name": "AI Vision Analysis",
      "type": "@n8n/n8n-nodes-langchain.aiVisionChatOpenAi",
      "parameters": {
        "imageInput": "={{ $binary.file }}"
      }
    },
    {
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondBody": "={{ JSON.stringify($json) }}"
      }
    }
  ]
}
```

---

## 🔍 Metode 3: Kirim Base64 (Tidak Recommended)

**Hanya untuk gambar kecil < 1MB**

```typescript
// Client-side
const handleBase64Upload = async (file: File) => {
  const reader = new FileReader();
  
  reader.onload = async () => {
    const base64 = reader.result as string;
    
    const response = await fetch('/api/webhooks/n8n/nyewaguard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        itemId: listingId,
        itemTitle: listing.title,
      }),
    });
  };
  
  reader.readAsDataURL(file);
};
```

**Kekurangan:**
- ❌ Base64 membuat ukuran file 33% lebih besar
- ❌ Tidak ideal untuk gambar > 1MB
- ❌ Memory intensive

---

## 📊 Perbandingan Metode

| Aspek | URL (Current) | Binary Upload | Base64 |
|-------|---------------|---------------|--------|
| **Implementasi** | ✅ Simple | ⚠️ Complex | ⚠️ Medium |
| **Bandwidth** | ✅ Minimal | ⚠️ Full size | ❌ +33% overhead |
| **Cloudinary Required** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **n8n Processing** | ✅ Download otomatis | ✅ Direct binary | ⚠️ Decode needed |
| **Best for** | Production | Dev/Testing | Very small images |

---

## 🎯 Rekomendasi

**GUNAKAN METODE 1 (URL)** - Sudah optimal untuk production:
- User upload ke Cloudinary (gratis tier 25GB storage)
- Dapat URL publik yang bisa di-cache
- n8n download image saat dibutuhkan
- Tidak membebani server Next.js

**Gunakan Metode 2 (Binary)** hanya jika:
- Development/testing tanpa Cloudinary
- Gambar sangat sensitif (tidak boleh disimpan di Cloudinary)
- Need immediate processing tanpa eksternal dependency

---

## 🧪 Testing dengan curl

### Test URL Method (Current):
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/nyewaguard \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_N8N_TOKEN" \
  -d '{
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "itemId": "123",
    "itemTitle": "Test Item",
    "checkType": "initial"
  }'
```

### Test Binary Method:
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/nyewaguard-binary \
  -H "Authorization: Bearer YOUR_N8N_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "itemId=123" \
  -F "itemTitle=Test Item"
```

---

## 📝 Summary

**Current implementation (URL method) sudah sempurna untuk production.**

Tidak perlu modifikasi kecuali ada requirement khusus untuk kirim file binary langsung.
