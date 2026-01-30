import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import axios from 'axios';

@Injectable()
export class AiService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async ask(prompt: string, message: string) {
    const provider = process.env.AI_PROVIDER || 'openai';

    switch (provider) {
      case 'openai':
        return this.askOpenAI(prompt, message);
      case 'gemini':
        return this.askGemini(prompt, message);
      case 'grok':
        return this.askGrok(prompt, message);
      case 'deepseek':
        return this.askDeepSeek(prompt, message);
      default:
        throw new Error('AI provider not supported');
    }
  }

  /* ===== OPENAI ===== */
  private async askOpenAI(prompt: string, message: string) {
    const res = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: message },
      ],
    });
    return res.choices[0].message.content;
  }

  /* ===== GEMINI ===== */
  private async askGemini(prompt: string, message: string) {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [{ text: prompt + '\n\n' + message }] }
        ]
      }
    );
    return res.data.candidates[0].content.parts[0].text;
  }

  /* ===== GROK ===== */
  private async askGrok(prompt: string, message: string) {
    const res = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-beta',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        },
      }
    );
    return res.data.choices[0].message.content;
  }

  /* ===== DEEPSEEK (RẺ NHẤT) ===== */
  private async askDeepSeek(prompt: string, message: string) {
    const res = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );
    return res.data.choices[0].message.content;
  }
}
