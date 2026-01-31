import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { processMessage } from '../ai/ai.pipeline';
import axios from 'axios';
import { detectIntent } from './intent.util';
import {
  LeadStatus,
  MessageIntent,
  MessageSender,
} from '@prisma/client';
import { assignSale } from '../sale/sale.assigner';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /* ===============================
     1️⃣ FACEBOOK WEBHOOK ENTRY
  ================================ */
  async handleWebhook(payload: any) {
    const entry = payload.entry?.[0];
    const messaging = entry?.messaging?.[0];

    // ❌ bỏ echo & payload rỗng
    if (!messaging || messaging.message?.is_echo) return { ok: true };

    const psid = messaging.sender?.id;
    const text = messaging.message?.text;
    if (!psid || !text) return { ok: true };

    /* ===============================
       🔹 CONVERSATION
    ================================ */
    let conversation = await this.prisma.conversation.findUnique({
      where: { psid },
    });

    // 🚫 Lead DONE → bot im lặng
    if (conversation && conversation.status === LeadStatus.DONE) {
      return { ok: true };
    }

    // ➕ Tạo lead mới
    if (!conversation) {
      const sale = await assignSale(this.prisma);

      conversation = await this.prisma.conversation.create({
        data: {
          psid,
          saleId: sale?.id,
          status: LeadStatus.NEW,
        },
      });
    }

    /* ===============================
       🔹 INTENT + PHONE
    ================================ */
    const intent: MessageIntent = detectIntent(text);
    const phone = this.extractPhone(text);
    const hasPhone = Boolean(phone);

    /* ===============================
       🔹 UPDATE LEAD STATUS
    ================================ */
    let status: LeadStatus = conversation.status;

    if (hasPhone) {
      status = LeadStatus.HOT;
    } else if (
      intent === MessageIntent.ASK_PRICE ||
      intent === MessageIntent.ASK_PRODUCT ||
      intent === MessageIntent.ASK_SHIP
    ) {
      status = LeadStatus.INTEREST;
    }

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        phone: phone ?? undefined,
        status,
        lastMessage: text,
      },
    });

    /* ===============================
       🔹 SAVE USER MESSAGE
    ================================ */
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.USER,
        content: text,
        intent,
      },
    });

    /* ===============================
       🔹 AI RESPONSE
    ================================ */
    const reply = await this.chat(
      conversation.id,
      text,
      status,
    );

    /* ===============================
       🔹 SAVE BOT MESSAGE
    ================================ */
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.BOT,
        content: reply,
        intent: MessageIntent.UNKNOWN,
      },
    });

    /* ===============================
       🔹 SEND TO FACEBOOK
    ================================ */
    await this.sendToFacebook(psid, reply);

    return { ok: true };
  }

  /* ===============================
     2️⃣ CORE CHAT LOGIC (AI)
  ================================ */
  async chat(
    conversationId: string,
    message: string,
    status: LeadStatus,
  ): Promise<string> {
    const products = await this.prisma.product.findMany();

    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const knowledgeBase = `
Bạn là chatbot bán hàng chuyên nghiệp.

TRẠNG THÁI KHÁCH: ${status}

QUY TẮC:
- NEW: chào hỏi, giới thiệu sản phẩm
- INTEREST: tư vấn + gợi ý để lại SĐT
- HOT: KHÔNG xin SĐT, chỉ xác nhận & hứa liên hệ
- DONE: KHÔNG trả lời
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
      userName: 'Khách',
      message,
      history: history.map((h) => h.content),
      knowledgeBase,
      hasPhone: status === LeadStatus.HOT,
    });

    let reply =
      typeof aiReply === 'string'
        ? aiReply
        : aiReply?.text ??
          'Shop hỗ trợ anh/chị ngay nhé ạ';

    // 🔥 ÉP CHỐT SĐT
    if (
      status === LeadStatus.INTEREST &&
      !reply.toLowerCase().includes('số')
    ) {
      reply +=
        '\n\n👉 Anh/chị để lại số điện thoại để shop tư vấn & chốt đơn nhanh hơn nhé ạ 📞';
    }

    if (status === LeadStatus.HOT) {
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
