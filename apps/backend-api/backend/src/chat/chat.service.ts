import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { processMessage } from '../ai/ai.pipeline';
import axios from 'axios';
import { detectIntent } from './intent.util';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /* ===============================
     1️⃣ WEBHOOK ENTRY
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

    // 🔹 Lưu USER message
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'USER',
        content: text,
      },
    });

    // 🔹 AI xử lý
    const reply = await this.chat(conversation.id, text);

    // 🔹 Lưu BOT message
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: 'BOT',
        content: reply,
      },
    });

    // 🔹 Gửi Facebook
    await this.sendToFacebook(psid, reply);

    return { ok: true };
  }

  /* ===============================
     2️⃣ CORE CHAT LOGIC
  ================================ */
  async chat(conversationId: string, message: string): Promise<string> {
    const products = await this.prisma.product.findMany();

    // 🔹 Lịch sử chat
    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // 🔹 Intent + Phone
    const intent = detectIntent(message);
    const phone = this.extractPhone(message);
    const hasPhone = Boolean(phone);

    const shouldAskPhone =
      !hasPhone &&
      (intent === 'ask_price' ||
        intent === 'order' ||
        intent === 'shipping');

    // 🔹 Update phone nếu có
    if (phone) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { phone },
      });
    }

    const knowledgeBase = `
Bạn là chatbot bán hàng chuyên nghiệp.

TRẠNG THÁI KHÁCH:
- Intent: ${intent}
- ${hasPhone ? 'ĐÃ CÓ SĐT' : 'CHƯA CÓ SĐT'}

QUY TẮC:
1. Nếu chưa có SĐT & intent là hỏi giá / ship / mua → gợi ý để lại SĐT
2. Nếu đã có SĐT → không xin lại
3. Không bịa, không suy diễn

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
      userName: 'Khách',
      message,
      history: history.map((h) => h.content),
      knowledgeBase,
      hasPhone,
    });

    let reply =
      typeof aiReply === 'string'
        ? aiReply
        : aiReply?.text ?? '';

    // 🔥 ÉP CHỐT SĐT
    if (shouldAskPhone && !reply.includes('số')) {
      reply +=
        '\n\n👉 Anh/chị để lại số điện thoại để shop tư vấn & chốt đơn nhanh hơn nhé ạ 📞';
    }

    if (hasPhone) {
      reply =
        'Cảm ơn anh/chị đã để lại số điện thoại 🙏 Nhân viên shop sẽ liên hệ ngay để tư vấn và chốt đơn ạ.';
    }

    return reply;
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
