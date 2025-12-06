import prisma from "@/app/libs/prismadb";
import { listingFallbackStore } from "@/app/libs/listingFallbackStore";

interface IParams {
  itemId?: string;
}

export default async function getItemById(params: IParams) {
  const { itemId } = params;
  if (!itemId) return null;

  // Detect dev fallback IDs: not 24-char hex ObjectId OR prefixed with 'dev_'
  const isFallbackId = itemId.startsWith('dev_') || itemId.length !== 24;

  if (isFallbackId) {
    // Find in in-memory fallback store
    const fallback = listingFallbackStore.find((l) => l.id === itemId);
    if (!fallback) return null;

    // Try to enrich user from DB if possible; otherwise create stub user
    let safeUser: any = null;
    try {
      const user = await prisma.user.findUnique({ where: { id: fallback.userId } });
      if (user) {
        safeUser = {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          emailVerified: user.emailVerified?.toISOString() || null,
        };
      }
    } catch {
      // Swallow errors (DB might be down), provide minimal stub
    }
    if (!safeUser) {
      const now = new Date().toISOString();
      safeUser = {
        id: fallback.userId,
        name: 'Dev User',
        email: null,
        emailVerified: null,
        image: null,
        hashedPassword: null,
        createdAt: now,
        updatedAt: now,
        favoriteIds: [],
        plan: 'FREE',
      };
    }

    return {
      ...fallback,
      createdAt: fallback.createdAt, // already ISO string
      user: safeUser,
    } as any;
  }

  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { user: true },
    });
    if (!item) return null;
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      user: {
        ...item.user,
        createdAt: item.user.createdAt.toISOString(),
        updatedAt: item.user.updatedAt.toISOString(),
        emailVerified: item.user.emailVerified?.toISOString() || null,
      },
    };
  } catch (error: any) {
    // If the DB throws due to malformed ObjectId, treat as fallback
    if (typeof error?.message === 'string' && error.message.includes('Malformed ObjectID')) {
      const fallback = listingFallbackStore.find((l) => l.id === itemId);
      if (fallback) {
        const now = new Date().toISOString();
        return {
          ...fallback,
          createdAt: fallback.createdAt,
          user: {
            id: fallback.userId,
            name: 'Dev User',
            email: null,
            emailVerified: null,
            image: null,
            hashedPassword: null,
            createdAt: now,
            updatedAt: now,
            favoriteIds: [],
            plan: 'FREE',
          },
        } as any;
      }
    }
    throw new Error(error);
  }
}
