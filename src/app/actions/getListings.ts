import prisma from "@/app/libs/prismadb";
import { listingFallbackStore } from "@/app/libs/listingFallbackStore";

export interface IItemsParams {
  userId?: string;
  category?: string;
  locationValue?: string;
  isNyewaGuardVerified?: boolean;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  sort?: 'relevance' | 'recent' | 'priceAsc' | 'priceDesc';
  includeDeleted?: boolean;
  locationLat?: number;
  locationLng?: number;
  radiusKm?: number; // filter items within radius from provided lat/lng
  outsideLimit?: number; // display-only limit for outside radius items (handled in page.tsx)
}

export default async function getItems(params: IItemsParams) {
  try {
    const {
      userId,
      category,
      locationValue,
      isNyewaGuardVerified,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      q,
      sort,
  } = params;

    let query: any = {};
    // Exclude soft-deleted items by default (now that Prisma Client is generated)
    if (!params.includeDeleted) {
      query.isDeleted = { not: true } as any;
    }

    // Filter berdasarkan userId (pemilik barang)
    if (userId) {
      query.userId = userId;
    }

    // Filter berdasarkan kategori (Kamera, Drone, Proyektor, HT, dll.)
    if (category) {
      query.category = category;
    }

    // Filter berdasarkan lokasi (Semarang, Tembalang, dll.)
    if (locationValue) {
      query.locationValue = locationValue;
    }

    // Filter berdasarkan verifikasi NyewaGuard (barang yang aman)
    if (isNyewaGuardVerified !== undefined) {
      query.isNyewaGuardVerified = isNyewaGuardVerified;
    }

    // Filter berdasarkan harga minimum
    if (minPrice) {
      query.pricePerDay = {
        ...query.pricePerDay,
        gte: +minPrice,
      };
    }

    // Filter berdasarkan harga maksimum
    if (maxPrice) {
      query.pricePerDay = {
        ...query.pricePerDay,
        lte: +maxPrice,
      };
    }

    // Filter berdasarkan ketersediaan tanggal (barang tidak sedang dibooking)
    if (startDate && endDate) {
      query.NOT = {
        bookings: {
          some: {
            OR: [
              {
                endDate: { gte: startDate },
                startDate: { lte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
            ],
          },
        },
      };
    }

    // Basic search filter for q across title, description, brand, and category
    if (q && q.trim().length > 0) {
      const term = q.trim();
      query.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
        { specifications: { contains: term, mode: 'insensitive' } },
        { condition: { contains: term, mode: 'insensitive' } },
      ];
    }

    // Determine base ordering for non-relevance sorts
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'priceAsc') orderBy = { pricePerDay: 'asc' };
    if (sort === 'priceDesc') orderBy = { pricePerDay: 'desc' };
    if (sort === 'recent') orderBy = { createdAt: 'desc' };

    let items: any[] = [];
    let dbSucceeded = false;
    try {
      items = await prisma.item.findMany({
        where: query,
        orderBy,
      });
      dbSucceeded = true;
    } catch (dbErr: any) {
      // Graceful fallback in development when DB is unreachable
      const isDev = process.env.NODE_ENV !== 'production';
      const msg = (dbErr?.message || '').toString();
      if (isDev) {
        console.warn('[getItems] DB unavailable, returning empty list for dev. Error:', msg);
        // Use shared fallback store filtered similarly
        items = listingFallbackStore.filter(l => {
          if (query.isDeleted && l.isDeleted) return false;
          if (query.userId && l.userId !== query.userId) return false;
          if (query.category && l.category !== query.category) return false;
          if (query.locationValue && l.locationValue !== query.locationValue) return false;
          if (query.isNyewaGuardVerified !== undefined && l.isNyewaGuardVerified !== query.isNyewaGuardVerified) return false;
          if (query.pricePerDay) {
            if (query.pricePerDay.gte && l.pricePerDay < query.pricePerDay.gte) return false;
            if (query.pricePerDay.lte && l.pricePerDay > query.pricePerDay.lte) return false;
          }
          // Basic text search OR group
          if (query.OR) {
            const term = (q || '').trim().toLowerCase();
            if (term) {
              const hay = [l.title, l.description, l.brand, l.category, l.specifications, l.condition]
                .map(v => (v || '').toLowerCase());
              if (!hay.some(h => h.includes(term))) return false;
            }
          }
          return true;
        });
        // For DB-down scenario just continue with fallback items
      }
      // In production, rethrow to surface real issue; in development, continue with fallback items
      if (process.env.NODE_ENV === 'production') {
        throw dbErr;
      }
    }
    // Merge dev fallback listings only if DB succeeded (development only)
    if (dbSucceeded && process.env.NODE_ENV !== 'production' && listingFallbackStore.length) {
      const applyFilter = (l: any) => {
        if (query.isDeleted && l.isDeleted) return false;
        if (query.userId && l.userId !== query.userId) return false;
        if (query.category && l.category !== query.category) return false;
        if (query.locationValue && l.locationValue !== query.locationValue) return false;
        if (query.isNyewaGuardVerified !== undefined && l.isNyewaGuardVerified !== query.isNyewaGuardVerified) return false;
        if (query.pricePerDay) {
          if (query.pricePerDay.gte && l.pricePerDay < query.pricePerDay.gte) return false;
          if (query.pricePerDay.lte && l.pricePerDay > query.pricePerDay.lte) return false;
        }
        if (query.OR && q && q.trim()) {
          const term = q.trim().toLowerCase();
          const hay = [l.title, l.description, l.brand, l.category, l.specifications, l.condition]
            .map(v => (v || '').toLowerCase());
          if (!hay.some(h => h.includes(term))) return false;
        }
        return true;
      };
      const filteredFallback = listingFallbackStore.filter(applyFilter);
      // Build composite keys from DB items to identify semantic duplicates
      const existingIds = new Set(items.map(i => i.id));
      const existingKeys = new Set(
        items.map(i => `${String(i.userId)}|${String(i.title).trim().toLowerCase()}|${Number(i.pricePerDay)}`)
      );
      const merged = items.concat(
        filteredFallback.filter(f => {
          if (existingIds.has(f.id)) return false;
          const key = `${String(f.userId)}|${String(f.title).trim().toLowerCase()}|${Number(f.pricePerDay)}`;
          return !existingKeys.has(key);
        })
      );
      items = merged;
    }

  // Ranking: fuzzy-ish scoring & prioritize title/brand; light fallback if query short
    let ranked = items;
    if (sort !== 'relevance' && sort) {
      ranked = items; // explicit sort overrides relevance scoring
    } else if (q && q.trim().length > 0) {
      const raw = q.trim();
      const term = raw.toLowerCase();
      const termLen = term.length;

      // Precompute a lightweight trigram / substring set for fuzzy contains
      const cache = new Map<string, Set<string>>();
      const fuzzify = (s: string) => {
        if (cache.has(s)) return cache.get(s)!;
        const str = s.toLowerCase();
        const grams = new Set<string>();
        for (let i = 0; i < str.length - 2; i++) {
          grams.add(str.slice(i, i + 3));
        }
        cache.set(s, grams);
        return grams;
      };

      const termTrigrams = fuzzify(term);

      const fuzzyContains = (field: string) => {
        if (!field) return 0;
        const f = field.toLowerCase();
        if (f.includes(term)) return 1; // direct contains
        // short queries: skip fuzzy (avoid noise for <=2 chars)
        if (termLen < 3) return 0;
        const grams = fuzzify(f);
        let matchCount = 0;
        termTrigrams.forEach(g => { if (grams.has(g)) matchCount++; });
        const ratio = matchCount / Math.max(1, termTrigrams.size);
        return ratio >= 0.4 ? ratio : 0; // threshold gate
      };

      const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const scoreFor = (it: any) => {
        const title = (it.title || '');
        const brand = (it.brand || '');
        const category = (it.category || '');
        const specs = (it.specifications || '');
        const desc = (it.description || '');

        let s = 0;
        // Exact / prefix boosts
        if (title.toLowerCase().startsWith(term)) s += 140;
        if (brand.toLowerCase().startsWith(term)) s += 120;
        // Whole word boundary-ish match (simple)
        const wordBoundary = new RegExp(`(^|\\s)${escapeRegExp(term)}(?=$|\\s)`, 'i');
        if (wordBoundary.test(title)) s += 40;
        if (wordBoundary.test(brand)) s += 35;

        // Contains (non prefix)
        if (title.toLowerCase().includes(term)) s += 70;
        if (brand.toLowerCase().includes(term)) s += 60;
        if (category.toLowerCase().includes(term)) s += 35;
        if (specs.toLowerCase().includes(term)) s += 25;
        if (desc.toLowerCase().includes(term)) s += 15;

        // Fuzzy partial overlap (scaled)
        s += fuzzyContains(title) * 30;
        s += fuzzyContains(brand) * 25;
        s += fuzzyContains(specs) * 15;
        s += fuzzyContains(desc) * 10;

        // Recent boost (items < 7 days old)
        const days = (Date.now() - new Date(it.createdAt).getTime()) / 86400000;
        if (days < 7) s += 8 - Math.floor(days); // up to +8 day 0

        // Verified & rich media slight bonus
        if (it.isNyewaGuardVerified) s += 10;
        // More verification photos (guard images length) bonus
        try {
          if (it.initialConditionJson) {
            const parsed = JSON.parse(it.initialConditionJson);
            if (Array.isArray(parsed?.images)) s += Math.min(12, parsed.images.length * 2);
          }
        } catch { /* ignore */ }

        return s;
      };

      ranked = [...items].sort((a, b) => scoreFor(b) - scoreFor(a));
    }

    // Distance filtering post-fetch (MongoDB geospatial not used directly)
    let withDistance = ranked.map((item) => ({
      ...item,
      createdAt: (item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt),
      distanceKm: undefined as number | undefined,
    }));

    if (params.locationLat !== undefined && params.locationLng !== undefined) {
      const { locationLat, locationLng } = params;
      const toRad = (d: number) => d * Math.PI / 180;
      const R = 6371; // Earth radius km
      const computeDistance = (lat1: number, lon1: number, lat2?: number | null, lon2?: number | null) => {
        if (lat2 == null || lon2 == null) return undefined;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };
      withDistance = withDistance.map(it => {
        const d = computeDistance(locationLat!, locationLng!, it.latitude as any, it.longitude as any);
        return { ...it, distanceKm: d };
      });
      // Do NOT filter by radius here; allow caller (homepage) to split nearby vs others.
      // Keep ranking order unless explicit sort; optional distance-based secondary sort can be applied by consumer.
    }

    return withDistance;
  } catch (error: any) {
    throw new Error(error);
  }
}
