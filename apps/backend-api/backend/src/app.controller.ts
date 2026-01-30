import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('test-db')
  async testDb() {
    const count = await this.prisma.product.count();

    return {
      status: 'OK',
      productCount: count,
    };
  }
}
