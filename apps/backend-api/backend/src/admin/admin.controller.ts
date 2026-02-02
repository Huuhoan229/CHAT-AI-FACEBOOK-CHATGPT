import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

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
     3️⃣ MARK LEAD DONE
  ================================ */
  @Patch('conversations/:id/done')
  async markDone(@Param('id') id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { status: LeadStatus.DONE },
    });
  }

  /* ===============================
     4️⃣ UPDATE NOTE
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
     📊 5️⃣ DASHBOARD STATS (7.7)
  ================================ */
  @Get('stats')
  async getStats() {
    const [
      total,
      newLead,
      interest,
      hot,
      done,
    ] = await Promise.all([
      this.prisma.conversation.count(),
      this.prisma.conversation.count({
        where: { status: LeadStatus.NEW },
      }),
      this.prisma.conversation.count({
        where: { status: LeadStatus.INTEREST },
      }),
      this.prisma.conversation.count({
        where: { status: LeadStatus.HOT },
      }),
      this.prisma.conversation.count({
        where: { status: LeadStatus.DONE },
      }),
    ]);

    return {
      total,
      new: newLead,
      interest,
      hot,
      done,
    };
  }

  /* ===============================
     ⚙️ 6️⃣ EMAIL CONFIG (7.6)
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

  @Patch('conversations/:id/pause-bot')
  pauseBot(@Param('id') id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { botPaused: true },
    });
  }

  @Patch('conversations/:id/resume-bot')
  resumeBot(@Param('id') id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: { botPaused: false },
    });
  }
