import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { listingId, startDate, endDate, totalPrice, serviceFee, depositAmount, logisticsMethod, logisticsFee } = body;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return NextResponse.error();
  }

  const itemAndBooking = await prisma.item.update({
    where: {
      id: listingId,
    },
    data: {
      bookings: {
        create: {
          userId: currentUser.id,
          startDate,
          endDate,
          totalPrice,
          serviceFee: serviceFee ?? 0,
          depositAmount: depositAmount ?? 0,
          logisticsMethod: logisticsMethod ?? 'Self-Pickup',
          logisticsFee: logisticsFee ?? 0,
        },
      },
    },
  });

  return NextResponse.json(itemAndBooking);
}
