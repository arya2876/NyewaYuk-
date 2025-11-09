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

    const items = await prisma.item.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeItems = items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));

    return safeItems;
  } catch (error: any) {
    throw new Error(error);
  }
}
