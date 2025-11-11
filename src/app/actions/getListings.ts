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

    // Ranking: prioritize matches in title/brand over other fields
    let ranked = items;
    if (sort !== 'relevance' && sort) {
      // For explicit non-relevance sorts we skip custom ranking
      ranked = items;
    } else if (q && q.trim().length > 0) {
      const term = q.trim().toLowerCase();
      const scoreFor = (it: any) => {
        const title = (it.title || '').toLowerCase();
        const brand = (it.brand || '').toLowerCase();
        const category = (it.category || '').toLowerCase();
        const specs = (it.specifications || '').toLowerCase();
        const desc = (it.description || '').toLowerCase();

        let s = 0;
        // startsWith is strongest
        if (title.startsWith(term)) s += 100;
        if (brand.startsWith(term)) s += 90;
        // contains has lower weight
        if (title.includes(term)) s += 60;
        if (brand.includes(term)) s += 50;
        if (category.includes(term)) s += 30;
        if (specs.includes(term)) s += 20;
        if (desc.includes(term)) s += 10;
        // recency slight boost
        s += Math.min(5, Math.max(0, (Date.now() - new Date(it.createdAt).getTime()) / (1000 * 3600 * 24) < 7 ? 5 : 0));
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
