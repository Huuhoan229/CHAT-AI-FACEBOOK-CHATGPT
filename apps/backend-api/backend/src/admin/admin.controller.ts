import { Controller, Get, Param, Patch } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  /* ===============================
     1️⃣ DANH SÁCH LEAD
  ================================ */
  @Get('conversations')
  async getConversations() {
    return this.prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // message cuối
        },
      },
    });
  }

  /* ===============================
     2️⃣ CHI TIẾT 1 LEAD
  ================================ */
  @Get('conversations/:id')
  async getConversation(@Param('id') id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /* ===============================
     3️⃣ SALE ĐÁNH DẤU DONE
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
}
