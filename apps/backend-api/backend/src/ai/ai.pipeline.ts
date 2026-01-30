import { callGeminiRetail } from './gemini.retail';

export async function processMessage({
  userName,
  message,
  history,
  knowledgeBase,
  hasPhone,
}) {
  const result = await callGeminiRetail(
    message,
    userName,
    history,
    knowledgeBase,
    null,
    hasPhone,
  );

  return result.text;
}
