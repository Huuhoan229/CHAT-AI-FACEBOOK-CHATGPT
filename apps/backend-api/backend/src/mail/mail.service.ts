import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendLeadMail(to: string, payload: {
    phone?: string;
    status: string;
    lastMessage: string;
  }) {
    await this.transporter.sendMail({
      from: `"AI BOT" <${process.env.MAIL_USER}>`,
      to,
      subject: '🔥 LEAD HOT MỚI',
      html: `
        <h3>📞 Lead mới từ Facebook</h3>
        <p><b>SĐT:</b> ${payload.phone ?? 'Chưa có'}</p>
        <p><b>Trạng thái:</b> ${payload.status}</p>
        <p><b>Tin nhắn cuối:</b> ${payload.lastMessage}</p>
      `,
    });
  }
}
