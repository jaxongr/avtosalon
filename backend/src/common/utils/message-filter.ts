import { ParsedCarData } from '../interfaces/parsed-car-data.interface';

const REAL_ESTATE_KEYWORDS = [
  'kvartira', 'квартира', 'xonadon', 'хонадон',
  'uy sotiladi', 'уй сотилади', 'dom prodaetsya',
  'участок', 'uchastok', 'sotix', 'сотих',
  'turar joy', 'турар жой', 'etaj', 'этаж',
  'xona', 'комната', 'komnata',
];

const LIVESTOCK_KEYWORDS = [
  'chorva', 'чорва', 'mol sotiladi', 'мол сотилади',
  'sigir', 'сигир', "qo'y", 'қўй', 'echki', 'эчки',
  "ho'kiz", 'хўкиз', 'buzoq', 'бузоқ',
  'ot sotiladi', 'от сотилади',
];

const CAR_KEYWORDS = [
  'mashina', 'мошина', 'мошинa', 'avto', 'авто',
  'sotiladi', 'сотилади', 'продается', 'продаётся',
  'probeg', 'пробег', 'yurgan', 'юрган',
  'kraska', 'краска', 'karopka', 'коробка',
  'mator', 'мотор', 'motor', 'dvigatel',
  'benzin', 'бензин', 'propan', 'пропан', 'metan', 'метан',
];

/**
 * Xabar mashina e'loniga tegishlimi?
 * Agar mashina brandi/modeli topilsa — albatta ha
 * Agar uy-joy/chorva so'zlari bo'lsa va mashina konteksti yo'q — yo'q
 */
export function isCarAd(text: string, parsed: ParsedCarData | null): boolean {
  // Agar brand yoki model topilgan bo'lsa — 100% mashina e'loni
  if (parsed?.brand || parsed?.model) return true;

  const lower = text.toLowerCase()
    .replace(/[\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'");

  // Uy-joy/chorva e'lonlari — mashina konteksti bo'lmasa filtrlash
  const hasRealEstate = REAL_ESTATE_KEYWORDS.some(kw => lower.includes(kw));
  const hasLivestock = LIVESTOCK_KEYWORDS.some(kw => lower.includes(kw));
  const hasCarContext = CAR_KEYWORDS.some(kw => lower.includes(kw));

  if ((hasRealEstate || hasLivestock) && !hasCarContext) return false;

  // Agar mashina so'zlari bo'lsa — ha
  if (hasCarContext) return true;

  // Default: agar narx va yil bor — ehtimol mashina
  if (parsed?.year && parsed?.priceAmount) return true;

  return false;
}
