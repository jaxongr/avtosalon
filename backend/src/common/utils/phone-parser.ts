/**
 * O'zbekiston telefon raqamlarini topish va normalizatsiya qilish
 * Formatlar: +998901234567, 998901234567, 90-123-45-67, 90 123 45 67, (90) 123-45-67
 */

const VALID_OPERATOR_CODES = [
  '20', '33', '50', '55', '70', '71', '77', '78', '88',
  '90', '91', '93', '94', '95', '97', '98', '99',
];

// Regex: +998 yoki 998 bilan yoki prefixsiz operator kodi bilan boshlanadi
const PHONE_REGEX = /(?:\+?998[\s\-.]?)?\(?\d{2}\)?[\s\-.]?\d{3}[\s\-.]?\d{2}[\s\-.]?\d{2}/g;

/**
 * Raw telefon raqamni +998XXXXXXXXX formatga keltirish
 * Noto'g'ri raqamlarni (narx, yil, probeg) filtrlash
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  let phone: string;
  if (digits.length === 12 && digits.startsWith('998')) {
    phone = '+' + digits;
  } else if (digits.length === 9) {
    phone = '+998' + digits;
  } else {
    return null;
  }

  // Operator kodini tekshirish
  const operatorCode = phone.substring(4, 6);
  if (!VALID_OPERATOR_CODES.includes(operatorCode)) {
    return null;
  }

  return phone;
}

/**
 * Matndan barcha telefon raqamlarni topish va normalizatsiya qilish
 * Duplikatlar olib tashlanadi
 */
export function extractPhones(text: string): string[] {
  const rawMatches = text.match(PHONE_REGEX) || [];
  const normalized = rawMatches
    .map(raw => normalizePhone(raw))
    .filter((p): p is string => p !== null);
  return [...new Set(normalized)];
}
