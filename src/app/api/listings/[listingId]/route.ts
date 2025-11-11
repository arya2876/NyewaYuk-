import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function DELETE(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();

  const { listingId } = params;
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const updated = await prisma.item.updateMany({
    where: { id: listingId, userId: currentUser.id },
    data: { isDeleted: true } as any,
  });
  return NextResponse.json(updated);
}

export async function PATCH(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();
  const { listingId } = params;
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }
  // Restore listing
  const restored = await prisma.item.updateMany({
    where: { id: listingId, userId: currentUser.id },
    data: { isDeleted: false } as any,
  });
  return NextResponse.json(restored);
}
