import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /* ===============================
     1️⃣ LIST LEADS
  ================================ */
  @Get('conversations')
  async getConversations() {
    return this.prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        sale: true,
      },
    });
  }

  /* ===============================
     2️⃣ CONVERSATION DETAIL
  ================================ */
  @Get('conversations/:id')
  async getConversation(@Param('id') id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        sale: true,
      },
    });
  }

  /* ===============================
     3️⃣ SALE XỬ LÝ XONG (BOT VẪN TƯ VẤN)
  ================================ */
  @Patch('conversations/:id/done-sale')
  async markDoneSale(@Param('id') id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: {
        status: LeadStatus.DONE_SALE,
        botPaused: false,
      },
    });
  }

  /* ===============================
     4️⃣ CHẶN BOT HOÀN TOÀN
  ================================ */
  @Patch('conversations/:id/block-bot')
  async blockBot(@Param('id') id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: {
        status: LeadStatus.DONE_BLOCK,
        botPaused: true,
      },
    });
  }

  /* ===============================
     5️⃣ TẠM PAUSE BOT
  ================================ */
  @Patch('conversations/:id/pause-bot')
  async pauseBot(@Param('id') id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { botPaused: true },
    });
  }

  /* ===============================
     6️⃣ RESUME BOT
  ================================ */
  @Patch('conversations/:id/resume-bot')
  async resumeBot(@Param('id') id: string) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id },
    });

    if (convo?.status === LeadStatus.DONE_BLOCK) {
      return {
        ok: false,
        reason: 'BOT_BLOCKED_PERMANENTLY',
      };
    }

    return this.prisma.conversation.update({
      where: { id },
      data: { botPaused: false },
    });
  }


  /* ===============================
     7️⃣ UPDATE NOTE
  ================================ */
  @Patch('conversations/:id/note')
  async updateNote(
    @Param('id') id: string,
    @Body('note') note: string,
  ) {
    return this.prisma.conversation.update({
      where: { id },
      data: { note },
    });
  }

  /* ===============================
     📊 8️⃣ DASHBOARD STATS
  ================================ */
    @Get('stats')
  async getStats() {
    const [rows] = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT status, COUNT(*)::int AS count
      FROM "Conversation"
      GROUP BY status
    `);

    const map: Record<string, number> = {};
    rows.forEach(r => {
      map[r.status] = r.count;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);

    return {
      total,
      new: map.NEW ?? 0,
      interest: map.INTEREST ?? 0,
      hot: map.HOT ?? 0,
      doneSale: map.DONE_SALE ?? 0,
      doneBlock: map.DONE_BLOCK ?? 0,
    };
  }



  /* ===============================
     ⚙️ 9️⃣ EMAIL CONFIG
  ================================ */
  @Get('config/email')
  getEmail() {
    return {
      email:
        process.env.LEAD_RECEIVER ||
        'vngenmart@gmail.com',
    };
  }
}
  
/* ===============================
   🔄 10️⃣ REOPEN LEAD (DONE → INTEREST)
================================ */
@Patch('conversations/:id/reopen')
async reopenLead(@Param('id') id: string) {
  return this.prisma.conversation.update({
    where: { id },
    data: {
      status: LeadStatus.INTEREST,
      botPaused: false,
    },
  });
}

@Patch('conversations/:id/sale-message')
async saleMessage(
  @Param('id') id: string,
  @Body('content') content: string,
) {
  // 1️⃣ Lưu tin nhắn SALE
  await this.prisma.message.create({
    data: {
      conversationId: id,
      sender: MessageSender.SALE,
      content,
    },
  });

  // 2️⃣ Pause bot ngay lập tức
  await this.prisma.conversation.update({
    where: { id },
    data: {
      botPaused: true,
      updatedAt: new Date(),
    },
  });

  return { ok: true };
}
