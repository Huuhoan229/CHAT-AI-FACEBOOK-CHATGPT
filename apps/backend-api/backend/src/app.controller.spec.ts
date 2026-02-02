import { Controller, Get, Param, Render } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /* ===============================
     DASHBOARD
  ================================ */
  @Get()
  @Render('admin/index')
  async dashboard() {
    const conversations = await this.prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const stats = {
      total: await this.prisma.conversation.count(),
      new: await this.prisma.conversation.count({
        where: { status: LeadStatus.NEW },
      }),
      interest: await this.prisma.conversation.count({
        where: { status: LeadStatus.INTEREST },
      }),
      hot: await this.prisma.conversation.count({
        where: { status: LeadStatus.HOT },
      }),
      done: await this.prisma.conversation.count({
        where: { status: LeadStatus.DONE },
      }),
    };

    return { conversations, stats };
  }

  /* ===============================
     DETAIL
  ================================ */
  @Get(':id')
  @Render('admin/conversation')
  async detail(@Param('id') id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return { conversation };
  }
}
