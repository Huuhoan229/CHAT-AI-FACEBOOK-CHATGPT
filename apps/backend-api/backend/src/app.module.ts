import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [PrismaModule, ProductModule, AiModule, ChatModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
