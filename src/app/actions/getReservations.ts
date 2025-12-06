import prisma from "@/app/libs/prismadb";
import { listingFallbackStore } from "@/app/libs/listingFallbackStore";

interface IParams {
  itemId?: string;
  userId?: string;
  ownerId?: string;
}

export default async function getBookings(params: IParams) {
  const { itemId, userId, ownerId } = params;

  // Early return for fallback dev listing IDs to avoid Prisma ObjectId errors
  const isFallbackId = itemId && (itemId.startsWith('dev_') || itemId.length !== 24);
  if (isFallbackId) {
    // Dev fallback listings have no real bookings; return empty array
    return [];
  }

  try {
    const query: any = {};
    if (itemId) query.itemId = itemId;
    if (userId) query.userId = userId;
    if (ownerId) query.item = { userId: ownerId };

    const bookings = await prisma.booking.findMany({
      where: query,
      include: { item: true },
      orderBy: { createdAt: "desc" },
    });

    return bookings.map((booking) => ({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      item: {
        ...booking.item,
        createdAt: booking.item.createdAt.toISOString(),
      },
    }));
  } catch (error: any) {
    // If malformed ObjectId, treat as no bookings (fallback scenario)
    if (typeof error?.message === 'string' && error.message.includes('Malformed ObjectID')) {
      return [];
    }
    throw new Error(error);
  }
}
