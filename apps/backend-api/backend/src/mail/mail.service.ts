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

  async sendLeadMail(data: {
    phone?: string;
    psid: string;
    conversationId: string;
  }) {
    const to =
      process.env.LEAD_RECEIVER || process.env.MAIL_USER;

    const adminUrl = `${process.env.ADMIN_URL}/admin/conversations/${data.conversationId}`;

    await this.transporter.sendMail({
      from: `"FB Chatbot" <${process.env.MAIL_USER}>`,
      to,
      subject: '🔥 LEAD HOT – Có khách để lại SĐT',
      html: `
        <h3>📞 Lead mới</h3>
        <p><b>SĐT:</b> ${data.phone || 'Không rõ'}</p>
        <p><b>PSID:</b> ${data.psid}</p>
        <p>
          <a href="${adminUrl}">
            👉 Xem hội thoại chi tiết
          </a>
        </p>
      `,
    });
  }
}
