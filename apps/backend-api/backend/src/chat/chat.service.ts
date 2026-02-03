import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { processMessage } from '../ai/ai.pipeline';
import { detectIntent } from './intent.util';
import {
  LeadStatus,
  MessageIntent,
  MessageSender,
} from '@prisma/client';
import { assignSale } from '../sale/sale.assigner';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /* ===============================
     🔁 GỘP MESSAGE + DELAY
  ================================ */
  private pendingMessages = new Map<string, string>();
  private pendingTimers = new Map<string, NodeJS.Timeout>();

  private dayDiff(from: Date) {
    return Math.floor(
      (Date.now() - from.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  /* ===============================
     1️⃣ FACEBOOK WEBHOOK
  ================================ */
  async handleWebhook(payload: any) {
    const messaging = payload.entry?.[0]?.messaging?.[0];
    if (!messaging || messaging.message?.is_echo) {
      return { ok: true };
    }

    const psid = messaging.sender?.id;
    const text = messaging.message?.text;
    const externalId = messaging.message?.mid;
    if (!psid || !text) return { ok: true };

    /* ===============================
       ❌ CHẶN DUP FACEBOOK
    ================================ */
    if (externalId) {
      const existed = await this.prisma.message.findUnique({
        where: { externalId },
      });
      if (existed) return { ok: true };
    }

    /* ===============================
       🔹 CONVERSATION
    ================================ */
    let conversation = await this.prisma.conversation.findUnique({
      where: { psid },
    });

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
       🔁 AUTO RESUME BOT (5.3)
    ================================ */
    if (conversation.botPaused) {
      const lastSaleMsg = await this.prisma.message.findFirst({
        where: {
          conversationId: conversation.id,
          sender: MessageSender.SALE,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastSaleMsg) {
        const minutes =
          (Date.now() - lastSaleMsg.createdAt.getTime()) /
          60000;

        if (minutes < 10) {
          return { ok: true };
        }

        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { botPaused: false },
        });
      }
    }

    /* ===============================
       🚫 BLOCK BOT HOÀN TOÀN
    ================================ */
    if (conversation.status === LeadStatus.DONE_BLOCK) {
      return { ok: true };
    }

    /* ===============================
       🔹 INTENT + PHONE
    ================================ */
    const intent = detectIntent(text);
    const phone = this.extractPhone(text);
    const hasPhone = Boolean(phone);

    let nextStatus = conversation.status;

    if (hasPhone) {
      nextStatus = LeadStatus.HOT;
    } else if (
      intent === MessageIntent.ASK_PRICE ||
      intent === MessageIntent.ASK_PRODUCT ||
      intent === MessageIntent.ASK_SHIP
    ) {
      // ❗ DONE_SALE KHÔNG BỊ ĐẨY NGƯỢC
      if (conversation.status !== LeadStatus.DONE_SALE) {
        nextStatus = LeadStatus.INTEREST;
      }
    }

    /* ===============================
       🔹 UPDATE CONVERSATION
    ================================ */
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        phone: phone ?? undefined,
        status: nextStatus,
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
        externalId,
      },
    });

    /* ===============================
       📧 SEND MAIL (CHỈ 1 LẦN)
    ================================ */
    if (hasPhone && !conversation.mailSent) {
      await this.mailService.sendLeadMail({
        phone: phone ?? undefined,
        psid,
        conversationId: conversation.id,
      });

      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { mailSent: true },
      });
    }

    /* ===============================
       🔁 GOM MESSAGE + DELAY AI
    ================================ */
    const prev = this.pendingMessages.get(conversation.id) || '';
    this.pendingMessages.set(
      conversation.id,
      prev ? prev + '\n' + text : text,
    );

    if (this.pendingTimers.has(conversation.id)) {
      clearTimeout(this.pendingTimers.get(conversation.id)!);
    }

    const timer = setTimeout(async () => {
      const finalMessage =
        this.pendingMessages.get(conversation.id);
      if (!finalMessage) return;

      const reply = await this.chat(
        conversation.id,
        finalMessage,
        nextStatus,
      );

      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: MessageSender.BOT,
          content: reply,
        },
      });

      await this.sendToFacebook(psid, reply);

      this.pendingMessages.delete(conversation.id);
      this.pendingTimers.delete(conversation.id);
    }, 2500);

    this.pendingTimers.set(conversation.id, timer);
    return { ok: true };
  }

  /* ===============================
     2️⃣ CHAT LOGIC (6.2 / 6.3)
  ================================ */
  async chat(
    conversationId: string,
    message: string,
    status: LeadStatus,
  ) {
    const products = await this.prisma.product.findMany();

    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const lastUser = [...history]
      .reverse()
      .find((m) => m.sender === MessageSender.USER);

    const days = lastUser
      ? this.dayDiff(lastUser.createdAt)
      : 0;

    let strategy = '';

    if (status === LeadStatus.DONE_SALE) {
      if (days < 1) {
        strategy = 'Chỉ hỗ trợ HDSD, KHÔNG bán thêm.';
      } else if (days <= 7) {
        strategy = 'Tư vấn nhẹ nếu khách hỏi.';
      } else {
        strategy =
          'Gợi ý sản phẩm liên quan, upsell rất nhẹ.';
      }
    }

    const knowledgeBase = `
Bạn là chatbot bán hàng chuyên nghiệp.
TRẠNG THÁI: ${status}
NGÀY KHÔNG NHẮN: ${days}

${strategy}

DANH SÁCH SẢN PHẨM:
${products
  .map(
    (p) => `
- ${p.name}: ${p.price} VND
${p.description}
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
        : aiReply?.text ?? 'Shop hỗ trợ anh/chị nhé ạ';

    if (
      status === LeadStatus.INTEREST &&
      !reply.toLowerCase().includes('số')
    ) {
      reply +=
        '\n\n👉 Anh/chị để lại SĐT để shop hỗ trợ nhanh hơn ạ 📞';
    }

    if (status === LeadStatus.HOT) {
      reply =
        'Cảm ơn anh/chị 🙏 Nhân viên shop sẽ liên hệ ngay ạ.';
    }

    return reply;
  }

  async sendToFacebook(psid: string, text: string) {
    const token = process.env.PAGE_ACCESS_TOKEN;
    if (!token) return;

    await axios.post(
      'https://graph.facebook.com/v19.0/me/messages',
      {
        recipient: { id: psid },
        message: { text },
      },
      { params: { access_token: token } },
    );
  }

  extractPhone(text: string) {
    const match = text.match(/(0|\+84|84)\d{8,9}/);
    if (!match) return null;
    return match[0].replace(/^(\+84|84)/, '0');
  }
}
