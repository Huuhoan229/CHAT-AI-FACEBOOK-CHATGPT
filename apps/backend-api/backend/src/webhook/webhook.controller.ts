import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import axios from 'axios';
import { processMessage } from '../ai/ai.pipeline';

@Controller('webhook')
export class WebhookController {

  /** VERIFY WEBHOOK */
  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
      return challenge;
    }
    return 'Verification failed';
  }

  /** RECEIVE MESSAGE */
  @Post()
  async receive(@Body() body: any) {
    const entry = body.entry?.[0];
    const event = entry?.messaging?.[0];
    if (!event?.message?.text) return 'OK';

    const senderId = event.sender.id;
    const message = event.message.text;

    // === TẠM THỜI (sau này nối DB)
    const userName = 'Khách';
    const history: string[] = [];
    const knowledgeBase = 'Shop có sản phẩm A giá 300k, freeship';
    const hasPhone = false;

    const reply = await processMessage({
      userId: senderId,
      userName,
      message,
      history,
      knowledgeBase,
      hasPhone,
    });

    await this.sendMessage(senderId, reply);
    return 'OK';
  }

  async sendMessage(psid: string, text: string) {
    const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.FB_PAGE_TOKEN}`;
    await axios.post(url, {
      recipient: { id: psid },
      message: { text },
    });
  }
}
