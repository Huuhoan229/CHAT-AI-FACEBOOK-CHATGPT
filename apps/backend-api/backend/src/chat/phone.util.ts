export function extractPhone(text: string): string | null {
  if (!text) return null;

  // Chuẩn VN: 0xxx | +84xxx | 84xxx
  const regex = /(0|\+84|84)(\d{8,9})/g;
  const match = text.match(regex);

  if (!match) return null;

  // Chuẩn hóa về 0xxx
  let phone = match[0];
  if (phone.startsWith('+84')) phone = '0' + phone.slice(3);
  if (phone.startsWith('84')) phone = '0' + phone.slice(2);

  return phone;
}
