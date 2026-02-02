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

  /* ===============================
     🕒 TIME DIFF HELPER
  ================================ */
  private getDayDiff(from: Date, to: Date) {
    const diff = to.getTime() - from.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /* ===============================
     1️⃣ FACEBOOK WEBHOOK ENTRY
  ================================ */
  async handleWebhook(payload: any) {
    const entry = payload.entry?.[0];
    const messaging = entry?.messaging?.[0];

    if (!messaging || messaging.message?.is_echo) {
      return { ok: true };
    }

    const psid = messaging.sender?.id;
    const text = messaging.message?.text;
    if (!psid || !text) return { ok: true };

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
      if (conversation.botPaused) {
        return { ok: true };
      }

      // DONE nhưng khách nhắn lại sau 1 ngày → mở lại lead
      if (
        conversation.status === LeadStatus.DONE &&
        conversation.updatedAt &&
        this.getDayDiff(
          new Date(conversation.updatedAt),
          new Date(),
        ) >= 1
      ) {
        conversation = await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: LeadStatus.INTEREST },
        });
      }

    /* ===============================
       🔹 INTENT + PHONE
    ================================ */
    const intent: MessageIntent = detectIntent(text);
    const phone = this.extractPhone(text);
    const hasPhone = Boolean(phone);
    const wasHot = conversation.status === LeadStatus.HOT;

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

    /* ===============================
       🔹 UPDATE CONVERSATION
    ================================ */
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

    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.BOT,
        content: reply,
        intent: MessageIntent.UNKNOWN,
        logReason: `
    STATUS=${status}
    DAY_DIFF=${dayDiff}
    HAS_PHONE=${status === LeadStatus.HOT}
    UPSCALE=${dayDiff > 7}
    `.trim(),
      },
    });

    /* ===============================
       📧 SEND MAIL (JUST HOT)
    ================================ */
    if (hasPhone && !wasHot) {
      await this.mailService.sendLeadMail({
        phone: phone ?? undefined,
        psid,
        conversationId: conversation.id,
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
      const finalMessage = this.pendingMessages.get(conversation.id);
      if (!finalMessage) return;

      const reply = await this.chat(
        conversation.id,
        finalMessage,
        status,
      );

      await this.prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender: MessageSender.BOT,
          content: reply,
          intent: MessageIntent.UNKNOWN,
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

    /* ===============================
       🕒 TIME-BASED STRATEGY (A/B/C)
    ================================ */
    const lastUserMsg = [...history]
      .reverse()
      .find((m) => m.sender === MessageSender.USER);

    let dayDiff = 0;
    if (lastUserMsg) {
      dayDiff = this.getDayDiff(
        new Date(lastUserMsg.createdAt),
        new Date(),
      );
    }

    let extraRule = '';

    if (status === LeadStatus.DONE) {
      if (dayDiff < 1) {
        extraRule = `
KHÁCH VỪA MUA.
- Chỉ hỗ trợ HDSD / bảo quản
- Không bán thêm
`;
      } else if (dayDiff <= 7) {
        extraRule = `
KHÁCH ĐÃ MUA GẦN ĐÂY.
- Tư vấn nhẹ nếu cần
- Không tạo áp lực mua
`;
      } else {
        extraRule = `
KHÁCH QUAY LẠI SAU THỜI GIAN DÀI.
- Có thể gợi ý sản phẩm liên quan
- Upsell nhẹ, thân thiện
`;
      }
    }

    const knowledgeBase = `
Bạn là chatbot bán hàng chuyên nghiệp.

TRẠNG THÁI KHÁCH: ${status}
SỐ NGÀY TỪ TIN NHẮN CUỐI: ${dayDiff}

QUY TẮC CHUNG:
- Không bịa
- Không suy diễn
- Không gây áp lực mua

${extraRule}

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
        : aiReply?.text ?? 'Shop hỗ trợ anh/chị ngay nhé ạ';

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
      'https://graph.facebook.com/v19.0/me/messages',
      {
        recipient: { id: psid },
        message: { text },
      },
      { params: { access_token: token } },
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
