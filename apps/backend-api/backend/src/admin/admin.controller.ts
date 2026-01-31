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
   5️⃣ DASHBOARD STATS (6.5)
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
    this.prisma.conversation.count({ where: { status: 'NEW' } }),
    this.prisma.conversation.count({ where: { status: 'INTEREST' } }),
    this.prisma.conversation.count({ where: { status: 'HOT' } }),
    this.prisma.conversation.count({ where: { status: 'DONE' } }),
  ]);

  // Lead hôm nay
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLead = await this.prisma.conversation.count({
    where: {
      createdAt: { gte: today },
    },
  });

  // HOT chưa xử lý
  const hotPending = await this.prisma.conversation.count({
    where: {
      status: 'HOT',
    },
  });

  return {
    total,
    todayLead,
    new: newLead,
    interest,
    hot,
    hotPending,
    done,
  };
}


  /* ===============================
     3️⃣ MARK LEAD DONE (6.3)
  ================================ */
  @Patch('conversations/:id/done')
  async markDone(@Param('id') id: string) {
    return this.prisma.conversation.update({
      where: { id },
      data: {
        status: LeadStatus.DONE,
      },
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
}
