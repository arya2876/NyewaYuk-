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
    // Deprecated fields removed: roomCount, bathroomCount, guestCount
    location,
    price,
    brand,
    completeness,
    condition,
    guardImages,
  } = body;

  // Validate required fields (explicitly)
  if (!title || !description || !category || !location?.value || !price) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }
  if (!brand || !condition) {
    return NextResponse.json({ message: 'Brand and condition are required' }, { status: 400 });
  }

  Object.keys(body).forEach((value: any) => {
    if (!body[value]) {
      NextResponse.error();
    }
  });

  // Normalize guard image (single string or first of array)
  const guardImage: string | undefined = typeof guardImages === 'string'
    ? guardImages
    : (Array.isArray(guardImages) && guardImages.length > 0 ? guardImages[0] : undefined);

  const item = await prisma.item.create({
    data: {
      title,
      description,
      imageSrc,
      category,
      locationValue: location.value,
      pricePerDay: parseInt(price, 10),
      brand: brand ?? null,
      condition: condition ?? null,
      specifications: completeness ?? null,
      initialConditionJson: guardImage ? JSON.stringify({ firstImage: guardImage }) : null,
      userId: currentUser.id,
      latitude: location.latlng?.[0] || 0,
      longitude: location.latlng?.[1] || 0,
    },
  });

  return NextResponse.json(item);
}
