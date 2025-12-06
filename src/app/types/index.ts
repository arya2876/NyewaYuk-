import { Item, Booking, User } from "@prisma/client";

// Keep legacy name SafeListing for compatibility, but map to Item
export type SafeListing = Omit<Item, "createdAt"> & {
  createdAt: string;
  distanceKm?: number; // injected in getListings for radius filtering display
};

export type SafeReservation = Omit<
  Booking,
  "createdAt" | "startDate" | "endDate" | "item"
> & {
  createdAt: string;
  startDate: string;
  endDate: string;
  item: SafeListing;
};

export type SafeUser = Omit<
  User,
  "createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  plan: string;
};
