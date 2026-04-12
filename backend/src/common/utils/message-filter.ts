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
 * QATTIQ FILTR: brand YOKI model topilishi SHART
 * Aks holda — unitaz, telefon, boshqa narsalar ham olinib ketadi
 */
export function isCarAd(text: string, parsed: ParsedCarData | null): boolean {
  if (!parsed) return false;

  // Brand yoki model topilishi SHART — bu asosiy filtr
  if (!parsed.brand && !parsed.model) return false;

  const lower = text.toLowerCase()
    .replace(/[\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'");

  // Uy-joy/chorva e'lonlari
  const hasRealEstate = REAL_ESTATE_KEYWORDS.some(kw => lower.includes(kw));
  const hasLivestock = LIVESTOCK_KEYWORDS.some(kw => lower.includes(kw));
  if (hasRealEstate || hasLivestock) return false;

  // Taksi/pochta/xizmat e'lonlari — mashina emas
  const SERVICE_KEYWORDS = [
    'ketamiz', 'кетамиз', 'yuraman', 'юраман',
    'pochta olamiz', 'почта оламиз', 'pochta olaman',
    'tunikafon', 'тоникафон', 'tonirovka xizmati',
    'akkumlyator sotiladi', 'аккумлятор сотилади',
    'zapchast sotiladi', 'запчаст сотилади',
  ];
  const isService = SERVICE_KEYWORDS.some(kw => lower.includes(kw));
  if (isService) return false;

  return true;
}
