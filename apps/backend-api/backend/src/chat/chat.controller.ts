import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('webhook')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ✅ BẮT BUỘC – Facebook VERIFY
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Facebook webhook verified');
      return challenge; // ⚠️ PHẢI return challenge
    }

    return '❌ Verification failed';
  }

  // POST – nhận message sau khi verify xong
  @Post()
  async handleMessage(@Body() body: any) {
    return this.chatService.handleWebhook(body);
  }
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.chatService.handleWebhook(body);
  }
}
