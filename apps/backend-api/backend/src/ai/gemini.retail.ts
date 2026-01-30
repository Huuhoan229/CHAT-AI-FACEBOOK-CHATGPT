import { getGeminiModel } from './gemini.model';

export async function callGeminiRetail(
  userMessage: string,
  userName: string,
  history: string[],
  knowledgeBase: string,
  imageUrl: string | null = null,
  hasPhone: boolean = false,
) {
  let model;

  try {
    model = await getGeminiModel();
  } catch (e) {
    return {
      text: 'Nhân viên Shop hiện tại đang bận, bạn đợi shop xíu nha ❤️',
    };
  }

  const prompt = `
Bạn là trợ lý bán hàng của shop.

LUẬT THÉP:
- Không bịa
- Không suy đoán
- Không trả lời ngoài dữ liệu được cung cấp

KHÁCH HÀNG:
- Tên: ${userName}
- Có SĐT: ${hasPhone ? 'Có' : 'Chưa'}

KIẾN THỨC SHOP:
${knowledgeBase}

LỊCH SỬ:
${history.join('\n')}

KHÁCH HỎI:
${userMessage}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { text };
  } catch (e) {
    return {
      text: 'Shop đang xử lý hơi chậm, bạn thông cảm nha ❤️',
    };
  }
}
