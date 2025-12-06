'use server';

// Server Actions untuk integrasi n8n Webhooks di NyewaYuk

const N8N_BOOKING_URL = process.env.N8N_CHECKOUT_WEBHOOK_URL;
// Prefer server env, but provide a safe fallback and debug log
const N8N_AI_SCAN_URL = process.env.N8N_NYEWAGUARD_WEBHOOK_URL
  || process.env.NEXT_PUBLIC_N8N_NYEWAGUARD_WEBHOOK_URL
  || 'https://arzwin.app.n8n.cloud/webhook-test/nyewaguard-scan';
const N8N_TOKEN = process.env.N8N_TOKEN;
const N8N_DEBUG = (process.env.N8N_DEBUG || 'false').toLowerCase() === 'true';
if (N8N_DEBUG) {
  console.log('[env] N8N_NYEWAGUARD_WEBHOOK_URL =', process.env.N8N_NYEWAGUARD_WEBHOOK_URL);
  console.log('[env] NEXT_PUBLIC_N8N_NYEWAGUARD_WEBHOOK_URL =', process.env.NEXT_PUBLIC_N8N_NYEWAGUARD_WEBHOOK_URL);
}

function logDebug(label: string, payload: unknown) {
  if (N8N_DEBUG) {
    try {
      console.log(`[n8n-debug] ${label}:`, typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));
    } catch {
      console.log(`[n8n-debug] ${label}:`, payload);
    }
  }
}

function parseJsonFromMaybeText(input: unknown): any | null {
  try {
    if (typeof input === 'string') {
      // try direct parse
      try { return JSON.parse(input); } catch {}
      // extract json block
      const cleaned = input.replace(/^```json\s*/i, '').replace(/```$/,'').trim();
      try { return JSON.parse(cleaned); } catch {}
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) { try { return JSON.parse(m[0]); } catch {} }
    } else if (input && typeof input === 'object' && 'rawText' in (input as any)) {
      return parseJsonFromMaybeText((input as any).rawText);
    }
  } catch {}
  return null;
}

interface BookingData {
  itemId: string;
  userId: string;
  itemTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  serviceFee?: number;
  depositAmount?: number;
  logisticsMethod?: string;
  logisticsFee?: number;
  userName?: string;
  userPhone: string;
  userEmail?: string;
}

interface AIVerificationData {
  imageUrl: string;
  checkType: 'pre-rental' | 'post-rental' | 'initial';
  itemId?: string;
  itemTitle?: string;
}

interface AIVerificationResult {
  isSafe: boolean;
  message: string;
  confidence: number;
  verified?: boolean;
  score?: number;
  damages?: string[];
}

/**
 * ACTION 1: createBookingViaN8n
 * Mengirim data booking ke n8n untuk diproses (WhatsApp notif, payment instruction, dll)
 */
export async function createBookingViaN8n(bookingData: BookingData): Promise<boolean> {
  // Validasi data
  if (!bookingData.itemId || !bookingData.userId || !bookingData.userPhone) {
    throw new Error('Data booking tidak lengkap: itemId, userId, dan userPhone wajib diisi');
  }

  if (!bookingData.totalPrice || bookingData.totalPrice <= 0) {
    throw new Error('Total harga harus lebih dari 0');
  }

  if (!N8N_BOOKING_URL) {
    throw new Error('N8N_CHECKOUT_WEBHOOK_URL tidak dikonfigurasi di environment variables');
  }

  try {
    const payload = {
      type: 'checkout',
      data: {
        userId: bookingData.userId,
        itemId: bookingData.itemId,
        itemTitle: bookingData.itemTitle || 'Item',
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalPrice: bookingData.totalPrice,
        serviceFee: bookingData.serviceFee || 0,
        depositAmount: bookingData.depositAmount || 0,
        logisticsMethod: bookingData.logisticsMethod || 'Self-Pickup',
        logisticsFee: bookingData.logisticsFee || 0,
        user: {
          name: bookingData.userName || 'Pengguna',
          phone: bookingData.userPhone,
          email: bookingData.userEmail || '',
        },
        paymentInfo: process.env.PAYMENT_ACCOUNT_INFO || 'BCA 123456 a.n NyewaYuk',
        termsUrl: process.env.TERMS_URL || 'https://example.com/terms',
      },
      timestamp: Date.now(),
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = (N8N_TOKEN || '').replace(/^Bearer\s+/i, '');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    logDebug('booking.request.url', N8N_BOOKING_URL);
    logDebug('booking.request.headers', headers);
    logDebug('booking.request.body', payload);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout to avoid hanging

    const response = await fetch(N8N_BOOKING_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logDebug('booking.response.error', { status: response.status, body: errorText });
      throw new Error(`n8n booking webhook gagal: ${response.status} - ${errorText}`);
    }

    const result = await response.json().catch(async () => {
      const text = await response.text().catch(() => '');
      logDebug('booking.response.text', text);
      return { ok: true };
    });
    logDebug('booking.response.json', result);

    // Check if n8n returned success status
    if (result.status === 'success' || result.ok === true) {
      return true;
    }

    // If response doesn't explicitly indicate failure, consider it success
    return true;

  } catch (error: any) {
    console.error('Error calling n8n booking webhook:', error);
    logDebug('booking.error', error?.message || error);
    throw new Error(`Gagal menghubungi n8n: ${error.message}`);
  }
}

/**
 * ACTION 2: verifyConditionViaN8n (NyewaGuard AI)
 * Mengirim gambar ke n8n untuk dianalisis menggunakan AI (computer vision)
 */
export async function verifyConditionViaN8n(
  data: AIVerificationData
): Promise<AIVerificationResult> {
  // Validasi data
  if (!data.imageUrl) {
    throw new Error('imageUrl wajib diisi');
  }

  if (!['pre-rental', 'post-rental', 'initial'].includes(data.checkType)) {
    throw new Error('checkType harus salah satu dari: pre-rental, post-rental, initial');
  }

  if (!N8N_AI_SCAN_URL) {
    throw new Error('N8N_NYEWAGUARD_WEBHOOK_URL tidak dikonfigurasi di environment variables');
  }

  try {
    const payload = {
      type: 'nyewaguard_verification',
      data: {
        // Kirim array dan juga satu string agar n8n mudah memilih sumber URL
        images: [data.imageUrl],
        imageUrl: data.imageUrl,
        itemId: data.itemId || 'unknown',
        itemTitle: data.itemTitle || 'Unknown Item',
        verificationType: data.checkType,
        timestamp: Date.now(),
      },
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = (N8N_TOKEN || '').replace(/^Bearer\s+/i, '');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    logDebug('ai.request.url', N8N_AI_SCAN_URL);
    logDebug('ai.request.headers', headers);
    logDebug('ai.request.body', payload);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(N8N_AI_SCAN_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logDebug('ai.response.error', { status: response.status, body: errorText });
      throw new Error(`n8n AI verification gagal: ${response.status} - ${errorText}`);
    }

    const result = await response.json().catch(async () => {
      const text = await response.text().catch(() => '');
      logDebug('ai.response.text', text);
      const parsed = parseJsonFromMaybeText(text);
      if (parsed) return parsed;
      return { ok: true, message: text };
    });
    logDebug('ai.response.json', result);

    // Parse n8n response
    // Expected format: { ok: true, verification: { verified, score, damages, summary } }
    const verification = result.verification || result;

    // Map to our interface
    const aiResult: AIVerificationResult = {
      isSafe: Boolean(verification.verified ?? ((verification.score ?? 100) >= 70)),
      message: verification.summary || verification.message || 'Analisis selesai',
      confidence: typeof verification.score === 'number' ? Math.min(Math.max(verification.score / 100, 0), 1) : 0.85,
      verified: verification.verified,
      score: verification.score,
      damages: verification.damages || [],
    };

    return aiResult;

  } catch (error: any) {
    console.error('Error calling n8n AI verification webhook:', error);
    logDebug('ai.error', error?.message || error);
    
    // Return fallback result if n8n is unavailable
    return {
      isSafe: false,
      message: `Gagal verifikasi AI: ${error.message}. Akan ditinjau manual.`,
      confidence: 0,
      verified: false,
    };
  }
}

/**
 * BONUS: Batch verification untuk multiple images
 */
export async function verifyMultipleImagesViaN8n(
  imageUrls: string[],
  itemId: string,
  itemTitle: string,
  checkType: 'pre-rental' | 'post-rental' | 'initial' = 'initial'
): Promise<AIVerificationResult> {
  if (!imageUrls || imageUrls.length === 0) {
    throw new Error('Minimal 1 gambar diperlukan untuk verifikasi');
  }

  if (!N8N_AI_SCAN_URL) {
    throw new Error('N8N_NYEWAGUARD_WEBHOOK_URL tidak dikonfigurasi');
  }

  try {
    const payload = {
      type: 'nyewaguard_verification',
      data: {
        images: imageUrls,
        itemId,
        itemTitle,
        verificationType: checkType,
        timestamp: Date.now(),
      },
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = (N8N_TOKEN || '').replace(/^Bearer\s+/i, '');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    logDebug('ai.batch.request.url', N8N_AI_SCAN_URL);
    logDebug('ai.batch.request.headers', headers);
    logDebug('ai.batch.request.body', payload);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(N8N_AI_SCAN_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logDebug('ai.batch.response.error', { status: response.status, body: errorText });
      throw new Error(`n8n AI verification failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json().catch(async () => {
      const text = await response.text().catch(() => '');
      logDebug('ai.batch.response.text', text);
      return { ok: true, message: text };
    });
    logDebug('ai.batch.response.json', result);
    const verification = result.verification || result;

    return {
      isSafe: verification.verified !== false && (verification.score || 100) >= 70,
      message: verification.summary || 'Analisis selesai',
      confidence: verification.score ? verification.score / 100 : 0.85,
      verified: verification.verified,
      score: verification.score,
      damages: verification.damages || [],
    };

  } catch (error: any) {
    console.error('Error in batch AI verification:', error);
    return {
      isSafe: false,
      message: `Gagal verifikasi AI: ${error.message}`,
      confidence: 0,
      verified: false,
    };
  }
}
