import { getServerSession } from "next-auth/next";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma from "@/app/libs/prismadb";

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export default async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return null;
    }

    // In development, bypass hard DB requirement to keep UI and server actions working
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      const now = new Date().toISOString();
      const id = (session.user as any).id || (session.user.email ? Buffer.from(session.user.email).toString("hex").slice(0,24) : "000000000000000000000000");
      return {
        id,
        name: session.user.name || null,
        email: session.user.email || null,
        emailVerified: null as string | null,
        image: session.user.image || null,
        hashedPassword: null as any,
        createdAt: now,
        updatedAt: now,
        favoriteIds: [],
        plan: ((session.user as any).plan as string) || "FREE",
        accounts: [],
        sessions: [],
        items: [],
        bookings: [],
      } as any;
    }

    // Try to read from DB first
    if (session.user.email) {
      try {
        const currentUser = await prisma.user.findUnique({
          where: { email: session.user.email as string },
        });

        if (currentUser) {
          return {
            ...currentUser,
            createdAt: currentUser.createdAt.toISOString(),
            updatedAt: currentUser.updatedAt.toISOString(),
            emailVerified: currentUser.emailVerified?.toISOString() || null,
            plan: (currentUser as any).plan || "FREE",
          };
        }
      } catch (dbErr) {
        // Fall through to session-only user below
        console.warn("DB unavailable in getCurrentUser, using session fallback");
      }
    }

    // Fallback: build a session-only user so UI can render dropdown
    const now = new Date().toISOString();
    const id = (session.user as any).id || (session.user.email ? Buffer.from(session.user.email).toString("hex").slice(0,24) : "000000000000000000000000");

    return {
      id,
      name: session.user.name || null,
      email: session.user.email || null,
      emailVerified: null as string | null,
      image: session.user.image || null,
      hashedPassword: null as any,
      createdAt: now,
      updatedAt: now,
      favoriteIds: [],
      plan: ((session.user as any).plan as string) || "FREE",
      accounts: [],
      sessions: [],
      items: [],
      bookings: [],
    } as any;
  } catch (error: any) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}
