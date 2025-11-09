import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const {
    title,
    description,
    imageSrc,
    category,
    roomCount,
    bathroomCount,
    guestCount,
    location,
    price,
  } = body;

  Object.keys(body).forEach((value: any) => {
    if (!body[value]) {
      NextResponse.error();
    }
  });

  const item = await prisma.item.create({
    data: {
      title,
      description,
      imageSrc,
      category,
      locationValue: location.value,
      pricePerDay: parseInt(price, 10),
      userId: currentUser.id,
      latitude: location.latlng?.[0] || 0,
      longitude: location.latlng?.[1] || 0,
    },
  });

  return NextResponse.json(item);
}
