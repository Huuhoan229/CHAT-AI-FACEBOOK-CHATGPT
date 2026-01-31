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
    const entry = payload.entry?.[0];
    const messaging = entry?.messaging?.[0];
    if (!messaging || messaging.message?.is_echo) return { ok: true };

    const psid = messaging.sender?.id;
    const text = messaging.message?.text;
    if (!psid || !text) return { ok: true };

    // 🔹 Upsert Conversation
    const conversation = await this.prisma.conversation.upsert({
      where: { psid },
      update: {},
      create: { psid },
    });

    // 🔹 Lưu message USER
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'USER',
        content: text,
      },
    });

    // 🔹 AI xử lý
    const reply = await this.chat(conversation.id, text);

    // 🔹 Lưu message BOT
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'BOT',
        content: reply,
      },
    });

    await this.sendToFacebook(psid, reply);
    return { ok: true };
  }

  /* ===============================
     2️⃣ CORE CHAT LOGIC
  ================================ */
  async chat(conversationId: string, message: string): Promise<string> {
    const products = await this.prisma.product.findMany();

    // 🔹 Lấy lịch sử chat thật
    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // 🔹 Detect phone
    const phone = this.extractPhone(message);
    const hasPhone = Boolean(phone);

    // 🔹 Update phone nếu có
    if (phone) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { phone },
      });
    }

    const knowledgeBase = `
Bạn là chatbot bán hàng.

TRẠNG THÁI KHÁCH:
- ${hasPhone ? 'ĐÃ có SĐT → XÁC NHẬN & HẸN GỌI' : 'CHƯA có SĐT → TƯ VẤN & GỢI Ý ĐỂ LẠI SĐT'}

LUẬT THÉP:
- Chỉ tư vấn dựa trên sản phẩm
- Không bịa
- Không suy diễn

SẢN PHẨM:
${products.map(p => `- ${p.name}: ${p.price} VND`).join('\n')}
`;

    const aiReply = await processMessage({
      userName: 'Khách',
      message,
      history: history.map(h => h.content),
      knowledgeBase,
      hasPhone,
    });

    if (typeof aiReply === 'string') return aiReply;
    if (aiReply?.text) return aiReply.text;

    return hasPhone
      ? 'Cảm ơn anh/chị đã để lại số điện thoại, shop sẽ liên hệ ngay ạ 📞'
      : 'Shop hỗ trợ anh/chị ngay nhé!';
  }

  /* ===============================
     3️⃣ SEND TO FACEBOOK
  ================================ */
  async sendToFacebook(psid: string, text: string) {
    const token = process.env.PAGE_ACCESS_TOKEN;
    if (!token) return;

    await axios.post(
      'https://graph.facebook.com/v18.0/me/messages',
      {
        recipient: { id: psid },
        message: { text },
      },
      {
        params: { access_token: token },
      },
    );
  }

  /* ===============================
     4️⃣ PHONE EXTRACTOR
  ================================ */
  extractPhone(text: string): string | null {
    const match = text.match(/(0|\+84|84)(\d{8,9})/);
    if (!match) return null;

    let phone = match[0];
    if (phone.startsWith('+84')) phone = '0' + phone.slice(3);
    if (phone.startsWith('84')) phone = '0' + phone.slice(2);
    return phone;
  }
}
