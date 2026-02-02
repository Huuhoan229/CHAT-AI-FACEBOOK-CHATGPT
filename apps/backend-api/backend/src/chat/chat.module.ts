import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    AiModule,
    MailModule, // 🔥 BẮT BUỘC
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
