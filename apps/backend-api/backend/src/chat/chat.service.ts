import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { processMessage } from '../ai/ai.pipeline';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async chat(message: string) {
    // 1️⃣ Lấy sản phẩm từ DB
    const products = await this.prisma.product.findMany();

    // 2️⃣ KHAI BÁO BIẾN THẬT (QUAN TRỌNG)
    const userName = 'Khách';
    const history: string[] = [];
    const hasPhone = false;

    // 3️⃣ Tạo knowledgeBase từ sản phẩm
    const knowledgeBase = `
Bạn là chatbot bán hàng.
LUẬT THÉP:
- Chỉ tư vấn dựa trên danh sách sản phẩm.
- Không bịa thông tin.
- Không tự suy diễn.
- Nếu không có thông tin thì nói rõ.

DANH SÁCH SẢN PHẨM:
${products
  .map(
    (p) => `
Tên: ${p.name}
Giá: ${p.price} VND
Mô tả: ${p.description}
Freeship: ${p.freeShip ? 'Có' : 'Không'}
`,
  )
  .join('\n')}
`;

    // 4️⃣ Gọi AI PIPELINE
    const reply = await processMessage({
      userName,
      message,
      history,
      knowledgeBase,
      hasPhone,
    });

    return reply;
  }
}
