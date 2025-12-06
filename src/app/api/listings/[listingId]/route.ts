import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { listingFallbackStore, persistFallbackListings } from "@/app/libs/listingFallbackStore";

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
  const url = new URL(request.url);
  const isPermanent = url.searchParams.get('permanent') === '1';

  if (isPermanent) {
    // Permanent delete: only allow if currently trashed
    try {
      const existing = await prisma.item.findUnique({ where: { id: listingId } });
      if (!existing || existing.userId !== currentUser.id) {
        return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
      }
      if (!(existing as any).isDeleted) {
        return NextResponse.json({ message: 'Item must be trashed before permanent delete' }, { status: 400 });
      }
      await prisma.item.delete({ where: { id: listingId } });
      return NextResponse.json({ ok: true, deleted: listingId });
    } catch (dbErr: any) {
      // Dev fallback: remove from in-memory store
      if (process.env.NODE_ENV !== 'production') {
        const idx = listingFallbackStore.findIndex((l) => l.id === listingId && l.userId === currentUser.id);
        if (idx >= 0) {
          listingFallbackStore.splice(idx, 1);
          persistFallbackListings();
          return NextResponse.json({ ok: true, deleted: listingId, devFallback: true });
        }
      }
      return NextResponse.json({ message: 'Failed to delete permanently' }, { status: 500 });
    }
  }

  // Soft delete (move to trash)
  try {
    const updated = await prisma.item.updateMany({
      where: { id: listingId, userId: currentUser.id },
      data: { isDeleted: true } as any,
    });
    return NextResponse.json(updated);
  } catch (dbErr: any) {
    if (process.env.NODE_ENV !== 'production') {
      const item = listingFallbackStore.find((l) => l.id === listingId && l.userId === currentUser.id);
      if (item) {
        item.isDeleted = true;
        persistFallbackListings();
        return NextResponse.json({ ok: true, id: listingId, devFallback: true });
      }
    }
    return NextResponse.json({ message: 'Failed to move to trash' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return NextResponse.error();
  const { listingId } = params;
  if (!listingId || typeof listingId !== "string") {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }
  // Restore listing
  try {
    const restored = await prisma.item.updateMany({
      where: { id: listingId, userId: currentUser.id },
      data: { isDeleted: false } as any,
    });
    return NextResponse.json(restored);
  } catch (dbErr: any) {
    if (process.env.NODE_ENV !== 'production') {
      const item = listingFallbackStore.find((l) => l.id === listingId && l.userId === currentUser.id);
      if (item) {
        item.isDeleted = false;
        persistFallbackListings();
        return NextResponse.json({ ok: true, id: listingId, devFallback: true });
      }
    }
    return NextResponse.json({ message: 'Failed to restore' }, { status: 500 });
  }
}
