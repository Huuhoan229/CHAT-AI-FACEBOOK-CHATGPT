import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getGeminiModel() {
  let apiKey = process.env.GEMINI_API_KEY;
  let modelName = 'gemini-2.0-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
  });
}
