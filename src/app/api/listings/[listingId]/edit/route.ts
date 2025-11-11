import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

interface IParams { listingId?: string; }

export async function PATCH(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const { listingId } = params;
  if (!listingId || typeof listingId !== 'string') {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }

  const existing = await prisma.item.findUnique({ where: { id: listingId } });
  if (!existing || existing.userId !== currentUser.id) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    description,
    pricePerDay,
    brand,
    condition,
    category,
    specifications,
    imageSrc,
    guardImages,
  } = body;

  // Normalize guard images to array
  const guardImagesArray: string[] = Array.isArray(guardImages)
    ? guardImages.filter((g) => typeof g === 'string' && g.length > 0)
    : (typeof guardImages === 'string' && guardImages.length > 0 ? [guardImages] : []);

  const initialConditionJson = guardImagesArray.length
    ? JSON.stringify({ images: guardImagesArray, firstImage: guardImagesArray[0] })
    : null;

  const isNyewaGuardVerified = guardImagesArray.length >= 3;

  const updated = await prisma.item.update({
    where: { id: listingId },
    data: {
      title: title ?? existing.title,
      description: description ?? existing.description,
      pricePerDay: typeof pricePerDay === 'number' ? pricePerDay : existing.pricePerDay,
      brand: brand ?? existing.brand,
      condition: condition ?? existing.condition,
      category: category ?? existing.category,
      specifications: specifications ?? existing.specifications,
      imageSrc: imageSrc ?? existing.imageSrc,
      initialConditionJson,
      isNyewaGuardVerified,
    },
  });

  return NextResponse.json(updated);
}
