// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import getItems, { IItemsParams } from '@/app/actions/getListings'

// Mock prisma client
vi.mock('@/app/libs/prismadb', () => {
  return {
    default: {
      item: {
        findMany: vi.fn(async (args: any) => {
          // Return a mixed set of items some deleted some active
          const data = [
            { id: 'a', title: 'Camera Alpha', isDeleted: false, createdAt: new Date(), brand: 'Sony', category: 'Kamera', description: '', specifications: '', isNyewaGuardVerified: false },
            { id: 'b', title: 'Drone Beta', isDeleted: true, createdAt: new Date(), brand: 'DJI', category: 'Drone', description: '', specifications: '', isNyewaGuardVerified: false },
            { id: 'c', title: 'HT Gamma', isDeleted: false, createdAt: new Date(), brand: 'ICOM', category: 'HT', description: '', specifications: '', isNyewaGuardVerified: false },
          ];
          // Simulate DB-level filtering by isDeleted if provided in where
          if (args?.where?.isDeleted?.not === true) {
            return data.filter(d => d.isDeleted !== true);
          }
          return data;
        })
      }
    }
  }
})

describe('getItems soft delete filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('excludes soft-deleted items by default', async () => {
    const items = await getItems({} as IItemsParams);
    const ids = items.map(i => i.id).sort();
    expect(ids).toEqual(['a', 'c']);
  });

  it('includes deleted when includeDeleted=true', async () => {
    const items = await getItems({ includeDeleted: true } as IItemsParams);
    const ids = items.map(i => i.id).sort();
    expect(ids).toEqual(['a', 'b', 'c']);
  });
});
