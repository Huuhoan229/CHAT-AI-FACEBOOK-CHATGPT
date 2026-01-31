export type Intent =
  | 'ASK_PRICE'
  | 'ASK_SHIP'
  | 'ASK_PRODUCT'
  | 'LEAVE_PHONE'
  | 'CHITCHAT';

export function detectIntent(text: string) {
  const msg = text.toLowerCase();

  if (/(giá|bao nhiêu|tiền)/.test(msg)) return 'ASK_PRICE';
  if (/(ship|vận chuyển|freeship)/.test(msg)) return 'ASK_SHIP';
  if (/(mua|đặt|chốt)/.test(msg)) return 'ASK_PRODUCT';
  if (/(0\d{9}|84\d{9}|\+84\d{9})/.test(msg)) return 'LEAVE_PHONE';

  return 'CHITCHAT';
}
