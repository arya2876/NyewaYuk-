// Shared in-memory fallback store for development when database is unavailable.
// Augmented with optional disk persistence (development only).

export interface FallbackListing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  locationValue: string;
  address: string | null;
  area: string | null;
  postalCode: string | null;
  specifications: string | null;
  pricePerDay: number;
  brand: string | null;
  condition: string | null;
  initialConditionJson: string | null;
  isNyewaGuardVerified: boolean;
  userId: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string; // ISO
  isDeleted?: boolean; // default false
}

export const listingFallbackStore: FallbackListing[] = [];

// --- Persistence Layer (dev only) ---
let persistenceEnabled = false;
const DATA_FILE = `${process.cwd().replace(/\\/g, '/')}/dev-data/fallbackListings.json`;

function loadFromDisk() {
  if (process.env.NODE_ENV !== 'development') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    if (!fs.existsSync(DATA_FILE)) {
      persistenceEnabled = true; // file can be created later
      return;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      parsed.forEach((entry) => {
        if (entry && typeof entry.id === 'string' && !listingFallbackStore.find((l) => l.id === entry.id)) {
          listingFallbackStore.push(entry);
        }
      });
    }
    persistenceEnabled = true;
  } catch {
    persistenceEnabled = false; // disable silently if fs not available
  }
}

export function persistFallbackListings() {
  if (!persistenceEnabled || process.env.NODE_ENV !== 'development') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(listingFallbackStore, null, 2), 'utf-8');
  } catch {
    // ignore write errors
  }
}

loadFromDisk();
