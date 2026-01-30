import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { processMessage } from '../ai/ai.pipeline';
import axios from 'axios';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /* ===============================
     1️⃣ WEBHOOK ENTRY POINT
  ================================ */
  async handleWebhook(payload: any) {
    try {
      const entry = payload.entry?.[0];
      const messaging = entry?.messaging?.[0];
      if (!messaging) return { ok: true };

      // ❌ bỏ echo message của Facebook
      if (messaging.message?.is_echo) return { ok: true };

      const senderId = messaging.sender?.id;
      const messageText = messaging.message?.text;

      if (!senderId || !messageText) return { ok: true };

      // 👉 gọi core chat
      const reply = await this.chat(messageText);

      // 👉 gửi reply về Facebook
      await this.sendToFacebook(senderId, reply);

      return { ok: true };
    } catch (err) {
      console.error('handleWebhook error:', err);
      return { ok: false };
    }
  }

  /* ===============================
     2️⃣ CORE CHAT LOGIC (AI)
  ================================ */
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

    // 4️⃣ Gọi AI pipeline
    const aiReply = await processMessage({
      userName,
      message,
      history,
      knowledgeBase,
      hasPhone,
    });

    // 5️⃣ Fallback an toàn
    if (typeof aiReply === 'string') return aiReply;
    if (aiReply?.text) return aiReply.text;

    return 'Shop sẽ phản hồi ngay cho bạn nhé 🙏';
  }

  /* ===============================
     3️⃣ SEND MESSAGE TO FACEBOOK
  ================================ */
  async sendToFacebook(psid: string, text: string) {
    const pageToken = process.env.PAGE_ACCESS_TOKEN;

    if (!pageToken) {
      console.error('Missing PAGE_ACCESS_TOKEN');
      return;
    }

    try {
      await axios.post(
        'https://graph.facebook.com/v18.0/me/messages',
        {
          recipient: { id: psid },
          message: { text },
        },
        {
          params: { access_token: pageToken },
        },
      );
    } catch (err) {
      console.error('sendToFacebook error:', err.response?.data || err.message);
    }
  }
}
