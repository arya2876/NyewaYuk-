import prisma from "@/app/libs/prismadb";

export interface GetOrdersParams {
  userId?: string | null;
}

export interface SafeOrder {
  id: string;
  userId: string;
  itemId: string;
  itemTitle?: string;
  phone: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default async function getOrders({ userId }: GetOrdersParams): Promise<SafeOrder[]> {
  if (!userId) return [];
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const itemIds = Array.from(new Set(orders.map((o) => o.itemId)));
    const items = await prisma.item.findMany({ where: { id: { in: itemIds } } });
    const itemMap = new Map(items.map((it) => [it.id, it.title]));

    return orders.map((o) => ({
      id: o.id,
      userId: o.userId,
      itemId: o.itemId,
      itemTitle: itemMap.get(o.itemId),
      phone: o.phone,
      total: o.total,
      status: String(o.status),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
