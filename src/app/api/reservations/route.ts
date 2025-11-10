import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const body = await request.json();
  const {
    itemId, // renamed from listingId
    startDate,
    endDate,
    totalPrice,
    serviceFee,
    depositAmount,
    logisticsMethod,
    logisticsFee,
  } = body || {};

  if (!itemId || !startDate || !endDate || !totalPrice) {
    return NextResponse.error();
  }

  // Create booking directly instead of nested update
  const booking = await prisma.booking.create({
    data: {
      userId: currentUser.id,
      itemId,
      startDate,
      endDate,
      totalPrice,
      serviceFee: serviceFee ?? 0,
      depositAmount: depositAmount ?? 0,
      logisticsMethod: logisticsMethod ?? 'Self-Pickup',
      logisticsFee: logisticsFee ?? 0,
    },
    include: {
      item: true,
    },
  });

  return NextResponse.json(booking);
}
