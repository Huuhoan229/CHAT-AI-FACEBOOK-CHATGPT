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

      // bỏ echo của Facebook
      if (messaging.message?.is_echo) return { ok: true };

      const senderId = messaging.sender?.id;
      const messageText = messaging.message?.text;

      if (!senderId || !messageText) return { ok: true };

      const reply = await this.chat(senderId, messageText);

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
  async chat(psid: string, message: string): Promise<string> {
    // 1️⃣ lấy sản phẩm
    const products = await this.prisma.product.findMany();

    // 2️⃣ nhận diện SĐT
    const phone = this.extractPhone(message);
    const hasPhone = Boolean(phone);

    // 3️⃣ lưu hội thoại
    await this.prisma.conversation.upsert({
      where: { psid },
      update: {
        lastMessage: message,
        phone: phone ?? undefined,
      },
      create: {
        psid,
        phone,
        lastMessage: message,
      },
    });

    // 4️⃣ context AI
    const userName = 'Khách';
    const history: string[] = [];

    const knowledgeBase = `
Bạn là chatbot bán hàng.

TRẠNG THÁI KHÁCH:
- ${hasPhone ? 'ĐÃ để lại SĐT → CHỈ XÁC NHẬN & HỨA GỌI LẠI' : 'CHƯA có SĐT → TƯ VẤN & GỢI Ý ĐỂ LẠI SĐT'}

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

    return hasPhone
      ? 'Cảm ơn anh/chị đã để lại số điện thoại, nhân viên shop sẽ liên hệ ngay ạ 📞'
      : 'Shop sẽ hỗ trợ anh/chị ngay nhé!';
  }

  /* ===============================
     3️⃣ SEND MESSAGE TO FACEBOOK
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

  /* ===============================
     4️⃣ PHONE EXTRACTOR
  ================================ */
  extractPhone(text: string): string | null {
    if (!text) return null;

    const regex = /(0|\+84|84)(\d{8,9})/;
    const match = text.match(regex);
    if (!match) return null;

    let phone = match[0];
    if (phone.startsWith('+84')) phone = '0' + phone.slice(3);
    if (phone.startsWith('84')) phone = '0' + phone.slice(2);

    return phone;
  }
}
