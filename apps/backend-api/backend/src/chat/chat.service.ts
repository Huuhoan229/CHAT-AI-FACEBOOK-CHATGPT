import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { processMessage } from '../ai/ai.pipeline';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // 👉 Webhook entry point
  async handleWebhook(payload: any) {
    try {
      const entry = payload.entry?.[0];
      const messaging = entry?.messaging?.[0];
      if (!messaging) return { ok: true };

      const senderId = messaging.sender?.id;
      const messageText = messaging.message?.text;

      if (!senderId || !messageText) return { ok: true };

      const reply = await this.chat(messageText);

      console.log('Reply to FB:', reply);

      // ⏭️ bước sau: gửi reply về Facebook
      return { ok: true };
    } catch (err) {
      console.error('handleWebhook error:', err);
      return { ok: false };
    }
  }

  // 👉 Core chat logic (Gemini pipeline)
  async chat(message: string): Promise<string> {
    // 1️⃣ Lấy sản phẩm
    const products = await this.prisma.product.findMany();

    // 2️⃣ Context
    const userName = 'Khách';
    const history: string[] = [];
    const hasPhone = false;

    // 3️⃣ Knowledge base
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

    // 4️⃣ Gọi AI
    const aiReply = await processMessage({
      userName,
      message,
      history,
      knowledgeBase,
      hasPhone,
    });

    // ⚠️ ÉP KIỂU AN TOÀN
    return typeof aiReply === 'string'
      ? aiReply
      : aiReply?.text || 'Shop sẽ phản hồi ngay cho bạn nhé!';
  }
}
