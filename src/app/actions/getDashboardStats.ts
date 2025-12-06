import prisma from '@/app/libs/prismadb';

// Simple in-memory cache with TTL to avoid heavy recomputation per identical query
type CacheEntry = { value: any; expiresAt: number };
const dashboardCache = new Map<string, CacheEntry>();
const DASHBOARD_TTL_MS = 60 * 1000; // 60s

export interface DashboardStatsParams {
  userId: string;
  fromDate?: string; // ISO
  toDate?: string;   // ISO
  page?: number;
  pageSize?: number;
}

// Aggregates key metrics for the dashboard.
export default async function getDashboardStats({ userId, fromDate, toDate, page = 1, pageSize = 8 }: DashboardStatsParams) {
  const cacheKey = JSON.stringify({ userId, fromDate, toDate, page, pageSize });
  const nowTs = Date.now();
  const cached = dashboardCache.get(cacheKey);
  if (cached && cached.expiresAt > nowTs) {
    return cached.value;
  }
  // Date range filter for bookings revenue metrics
  const dateFilter: any = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);

  const bookingWhere: any = { item: { userId } };
  if (Object.keys(dateFilter).length) bookingWhere.startDate = dateFilter; // use startDate window

  // Fetch bookings for owner items
  const bookings = await prisma.booking.findMany({
    where: bookingWhere,
    select: {
      id: true,
      totalPrice: true,
      serviceFee: true,
      depositAmount: true,
      logisticsFee: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      userId: true,
      itemId: true
    }
  });

  const itemsRaw = await prisma.item.findMany({ where: { userId }, select: { id: true, title: true, imageSrc: true, pricePerDay: true, rentCount: true, rating: true, /* @ts-ignore */ isDeleted: true as any } as any });
  const items = (itemsRaw as any[]).filter((i: any) => i?.isDeleted !== true);

  const totalRent = bookings.length;
  const completedRent = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice + b.serviceFee + b.logisticsFee, 0);
  const monthlyMap: Record<string, { rent: number; revenue: number }> = {};

  bookings.forEach(b => {
    const key = b.startDate.toISOString().slice(0,7); // YYYY-MM
    if (!monthlyMap[key]) monthlyMap[key] = { rent: 0, revenue: 0 };
    monthlyMap[key].rent += 1;
    monthlyMap[key].revenue += b.totalPrice + b.serviceFee + b.logisticsFee;
  });

  // Weekly revenue per item (last 7 days) & monthly revenue per item (current month)
  const weekStart = new Date(Date.now() - 6*86400000);
  const currentMonth = new Date().toISOString().slice(0,7); // YYYY-MM
  const revenueWeekItem: Record<string, number> = {};
  const revenueMonthItem: Record<string, number> = {};
  bookings.forEach(b => {
    const amount = b.totalPrice + b.serviceFee + b.logisticsFee;
    if (b.startDate >= weekStart) {
      revenueWeekItem[b.itemId] = (revenueWeekItem[b.itemId] || 0) + amount;
    }
    const monthKey = b.startDate.toISOString().slice(0,7);
    if (monthKey === currentMonth) {
      revenueMonthItem[b.itemId] = (revenueMonthItem[b.itemId] || 0) + amount;
    }
  });

  // Weekly revenue (last 7 days)
  const now = Date.now();
  const weekBuckets: Record<string, number> = {};
  for (let i=6;i>=0;i--) {
    const d = new Date(now - i*86400000);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    weekBuckets[label] = 0;
  }
  bookings.forEach(b => {
    const label = b.startDate.toLocaleDateString('en-US', { weekday: 'short' });
    if (weekBuckets[label] !== undefined) {
      weekBuckets[label] += b.totalPrice + b.serviceFee + b.logisticsFee;
    }
  });
  const weeklyRevenue = Object.entries(weekBuckets).map(([name, value]) => ({ name, value }));

  // Popular items (top by rentCount)
  const popular = items
    .sort((a,b) => b.rentCount - a.rentCount)
    .slice(0,4)
    .map(i => ({ id: i.id, title: (i as any).title, imageSrc: (i as any).imageSrc, rentCount: i.rentCount, rating: i.rating, pricePerDay: i.pricePerDay }));

  const topWeekly = Object.entries(revenueWeekItem)
    .sort((a,b) => b[1] - a[1])
    .slice(0,3)
    .map(([itemId, revenue]) => {
      const item = items.find(it => it.id === itemId);
      return { id: itemId, title: item ? (item as any).title ?? 'Item' : 'Item', imageSrc: item ? (item as any).imageSrc : null, revenue };
    });

  const topMonthly = Object.entries(revenueMonthItem)
    .sort((a,b) => b[1] - a[1])
    .slice(0,3)
    .map(([itemId, revenue]) => {
      const item = items.find(it => it.id === itemId);
      return { id: itemId, title: item ? (item as any).title ?? 'Item' : 'Item', imageSrc: item ? (item as any).imageSrc : null, revenue };
    });

  // Recent bookings with pagination and optional date filter
  const recentWhere: any = { item: { userId } };
  if (Object.keys(dateFilter).length) recentWhere.startDate = dateFilter;
  const safePageSize = Math.min(Math.max(1, pageSize), 50);
  const safePage = Math.max(1, page);
  const [recentTotal, recent] = await Promise.all([
    prisma.booking.count({ where: recentWhere }),
    prisma.booking.findMany({
      where: recentWhere,
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
      include: { item: true, user: true }
    })
  ]);

  const result = {
    summary: {
      totalRent,
      completedRent,
      totalRevenue,
    },
    weeklyRevenue,
    popular,
    recent: recent.map(r => ({
      id: r.id,
      itemId: r.itemId,
      itemTitle: (r as any).item?.title ?? '—',
      date: r.startDate,
      renter: (r as any).user?.name ?? '—',
      payment: r.status === 'completed' ? 'Paid' : (r.status === 'pending' ? 'Unpaid' : 'Paid'),
      status: r.status,
    })),
    recentTotal,
    topWeekly,
    topMonthly,
  };

  dashboardCache.set(cacheKey, { value: result, expiresAt: nowTs + DASHBOARD_TTL_MS });
  return result;
}
