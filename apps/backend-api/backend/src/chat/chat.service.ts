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

      if (messaging.message?.is_echo) return { ok: true };

      const senderId = messaging.sender?.id;
      const messageText = messaging.message?.text;

      if (!senderId || !messageText) return { ok: true };

      const reply = await this.chat(messageText);
      await this.sendToFacebook(senderId, reply);

      return { ok: true };
    } catch (err) {
      console.error('handleWebhook error:', err);
      return { ok: false };
    }
  }

  /* ===============================
     2️⃣ CORE CHAT LOGIC
  ================================ */
  async chat(message: string): Promise<string> {
    const products = await this.prisma.product.findMany();

    const userName = 'Khách';
    const history: string[] = [];
    const hasPhone = false;

    const knowledgeBase = `
Bạn là chatbot bán hàng.
LUẬT THÉP:
- Chỉ tư vấn dựa trên danh sách sản phẩm
- Không bịa
- Không suy diễn

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

    const aiReply = await processMessage({
      userName,
      message,
      history,
      knowledgeBase,
      hasPhone,
    });

    if (typeof aiReply === 'string') return aiReply;
    if (aiReply?.text) return aiReply.text;

    return 'Shop sẽ phản hồi ngay cho bạn nhé 🙏';
  }

  /* ===============================
     3️⃣ SEND TO FACEBOOK
  ================================ */
  async sendToFacebook(psid: string, text: string) {
    const pageToken = process.env.PAGE_ACCESS_TOKEN;
    if (!pageToken) return;

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
  }
}
