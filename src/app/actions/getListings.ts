import prisma from "@/app/libs/prismadb";

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

    const items = await prisma.item.findMany({
      where: query,
      orderBy,
    });

  // Ranking: fuzzy-ish scoring & prioritize title/brand; light fallback if query short
    let ranked = items;
    if (sort !== 'relevance' && sort) {
      ranked = items; // explicit sort overrides relevance scoring
    } else if (q && q.trim().length > 0) {
      const raw = q.trim();
      const term = raw.toLowerCase();
      const termLen = term.length;

      // Precompute a lightweight trigram / substring set for fuzzy contains
      const fuzzify = (s: string) => {
        const str = s.toLowerCase();
        const grams = new Set<string>();
        for (let i = 0; i < str.length - 2; i++) {
          grams.add(str.slice(i, i + 3));
        }
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
        const wordBoundary = new RegExp(`(^|\s)${term.replace(/[-/\\^$*+?.()|[\]{}]/g, '')}(?=$|\s)`, 'i');
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

    const safeItems = ranked.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));

    return safeItems;
  } catch (error: any) {
    throw new Error(error);
  }
}
