import prisma from "@/app/libs/prismadb";

interface IParams {
  itemId?: string;
}

export default async function getItemById(params: IParams) {
  try {
    const { itemId } = params;

    const item = await prisma.item.findUnique({
      where: {
        id: itemId,
      },
      include: {
        user: true,
      },
    });

    if (!item) {
      return null;
    }

    return {
      ...item,
      createdAt: item.createdAt.toString(),
      user: {
        ...item.user,
        createdAt: item.user.createdAt.toString(),
        updatedAt: item.user.updatedAt.toString(),
        emailVerified: item.user.emailVerified?.toString() || null,
      },
    };
  } catch (error: any) {
    throw new Error(error);
  }
}
