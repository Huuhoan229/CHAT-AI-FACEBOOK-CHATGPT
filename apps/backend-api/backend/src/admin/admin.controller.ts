import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // 🔹 Danh sách hội thoại (lead)
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

  // 🔹 Chi tiết 1 hội thoại
  @Get('conversations/:id')
  async getConversationDetail(@Param('id') id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
