import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    ChatModule, // 👈 THÊM DÒNG NÀY
  ],
  controllers: [AdminController],
})
export class AdminModule {}
