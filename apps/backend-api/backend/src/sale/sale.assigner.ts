import { PrismaService } from '../prisma/prisma.service';

export async function assignSale(prisma: PrismaService) {
  // 1️⃣ Lấy sale đang active
  const sales = await prisma.sale.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  if (sales.length === 0) return null;

  // 2️⃣ Đếm số lead mỗi sale
  const counts = await Promise.all(
    sales.map(async (sale) => {
      const count = await prisma.conversation.count({
        where: { saleId: sale.id },
      });
      return { sale, count };
    }),
  );

  // 3️⃣ Chọn sale ít lead nhất
  counts.sort((a, b) => a.count - b.count);

  return counts[0].sale;
}
