import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { WebhookModule } from './webhook/webhook.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    ProductModule,
    AiModule,
    ChatModule,
    WebhookModule,
    AdminModule, // ✅ Admin đi qua module
    MailModule, // 👈 THÊM
  ],
})
export class AppModule {}
