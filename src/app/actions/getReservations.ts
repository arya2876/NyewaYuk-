import prisma from "@/app/libs/prismadb";

interface IParams {
  itemId?: string;
  userId?: string;
  ownerId?: string;
}

export default async function getBookings(params: IParams) {
  try {
    const { itemId, userId, ownerId } = params;

    const query: any = {};

    if (itemId) {
      query.itemId = itemId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (ownerId) {
      query.item = { userId: ownerId };
    }

    const bookings = await prisma.booking.findMany({
      where: query,
      include: {
        item: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeBookings = bookings.map((booking) => ({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      item: {
        ...booking.item,
        createdAt: booking.item.createdAt.toISOString(),
      },
    }));

    return safeBookings;
  } catch (error: any) {
    throw new Error(error);
  }
}
