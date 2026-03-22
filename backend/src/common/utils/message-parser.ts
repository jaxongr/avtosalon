/**
 * Telegram xabaridan mashina va egasi haqida ma'lumot ajratib olish
 */

const CAR_BRANDS: Record<string, string[]> = {
  'Chevrolet': ['chevrolet', 'шевроле', 'шеви'],
  'Daewoo': ['daewoo', 'дэу', 'деу'],
  'Hyundai': ['hyundai', 'хюндай', 'хёндай', 'хундай'],
  'Kia': ['kia', 'киа', 'кия'],
  'Toyota': ['toyota', 'тойота', 'тоёта'],
  'Lexus': ['lexus', 'лексус'],
  'BMW': ['bmw', 'бмв', 'бэмвэ'],
  'Mercedes': ['mercedes', 'мерседес', 'мерс', 'benz'],
  'Audi': ['audi', 'ауди'],
  'Volkswagen': ['volkswagen', 'vw', 'фольксваген'],
  'Nissan': ['nissan', 'ниссан'],
  'Honda': ['honda', 'хонда'],
  'Mitsubishi': ['mitsubishi', 'митсубиси', 'митсубиши'],
  'Mazda': ['mazda', 'мазда'],
  'Ford': ['ford', 'форд'],
  'Opel': ['opel', 'опель'],
  'Peugeot': ['peugeot', 'пежо'],
  'Renault': ['renault', 'рено'],
  'Skoda': ['skoda', 'шкода'],
  'Lada': ['lada', 'лада', 'ваз', 'vaz', 'жигули'],
  'BYD': ['byd', 'бид', 'бюд'],
  'Geely': ['geely', 'джили'],
  'Chery': ['chery', 'чери', 'чэри'],
  'Haval': ['haval', 'хавал'],
  'JAC': ['jac', 'джак'],
  'Changan': ['changan', 'чанган'],
  'Jetour': ['jetour', 'жетур', 'джетур'],
  'Exeed': ['exeed', 'эксид'],
};

const CAR_MODELS: Record<string, string[]> = {
  'Malibu': ['malibu', 'малибу'],
  'Lacetti': ['lacetti', 'лачетти', 'лацетти', 'gentra', 'гентра'],
  'Cobalt': ['cobalt', 'кобальт'],
  'Nexia': ['nexia', 'нексия', 'nexia-3', 'нексия-3'],
  'Matiz': ['matiz', 'матиз'],
  'Spark': ['spark', 'спарк'],
  'Damas': ['damas', 'дамас'],
  'Labo': ['labo', 'лабо'],
  'Captiva': ['captiva', 'каптива'],
  'Tracker': ['tracker', 'трекер', 'тракер'],
  'Equinox': ['equinox', 'эквинокс'],
  'Tahoe': ['tahoe', 'тахо'],
  'Traverse': ['traverse', 'траверс'],
  'Onix': ['onix', 'оникс'],
  'Monza': ['monza', 'монза'],
  'Camry': ['camry', 'камри', 'кемри'],
  'Corolla': ['corolla', 'королла'],
  'RAV4': ['rav4', 'рав4', 'rav-4'],
  'Land Cruiser': ['land cruiser', 'ланд крузер', 'лк', 'lc'],
  'Prado': ['prado', 'прадо'],
  'Sonata': ['sonata', 'соната'],
  'Tucson': ['tucson', 'туксон', 'тусон'],
  'Accent': ['accent', 'акцент', 'солярис', 'solaris'],
  'Elantra': ['elantra', 'элантра'],
  'Santa Fe': ['santa fe', 'санта фе', 'сантафе'],
  'Rio': ['rio', 'рио'],
  'K5': ['k5', 'к5'],
  'Sportage': ['sportage', 'спортаж', 'спортейдж'],
};

const FUEL_TYPES: Record<string, string[]> = {
  'Benzin': ['benzin', 'бензин', 'бензинли'],
  'Dizel': ['dizel', 'diesel', 'дизель', 'дизел'],
  'Gaz': ['gaz', 'газ', 'метан', 'metan', 'propan', 'пропан'],
  'Gibrid': ['gibrid', 'hybrid', 'гибрид'],
  'Elektr': ['elektr', 'electr', 'электро', 'ev'],
};

const TRANSMISSION_TYPES: Record<string, string[]> = {
  'Avtomat': ['avtomat', 'автомат', 'automatic', 'акпп', 'at'],
  'Mexanika': ['mexanika', 'механика', 'manual', 'мкпп', 'mt', 'mexan'],
  'Tiptronik': ['tiptronik', 'типтроник'],
  'Variator': ['variator', 'вариатор', 'cvt'],
};

const COLOR_KEYWORDS: Record<string, string[]> = {
  'Oq': ['oq', 'белый', 'white', 'ок', 'oq rang'],
  'Qora': ['qora', 'черный', 'black', 'чёрный'],
  'Kumush': ['kumush', 'серебристый', 'silver', 'серый', 'kulrang'],
  'Ko\'k': ['kok', 'ko\'k', 'синий', 'blue', 'голубой'],
  'Qizil': ['qizil', 'красный', 'red'],
  'Yashil': ['yashil', 'зеленый', 'green'],
  'Sariq': ['sariq', 'желтый', 'yellow'],
};

export interface ParsedMessage {
  carBrand: string | null;
  carModel: string | null;
  carYear: number | null;
  carPrice: string | null;
  carColor: string | null;
  carMileage: string | null;
  carFuel: string | null;
  carTransmission: string | null;
  carDescription: string | null;
}

export function parseCarMessage(text: string): ParsedMessage {
  if (!text) {
    return { carBrand: null, carModel: null, carYear: null, carPrice: null, carColor: null, carMileage: null, carFuel: null, carTransmission: null, carDescription: null };
  }

  const lower = text.toLowerCase();
  const result: ParsedMessage = {
    carBrand: null,
    carModel: null,
    carYear: null,
    carPrice: null,
    carColor: null,
    carMileage: null,
    carFuel: null,
    carTransmission: null,
    carDescription: text.substring(0, 500),
  };

  // Brand
  for (const [brand, keywords] of Object.entries(CAR_BRANDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.carBrand = brand;
      break;
    }
  }

  // Model
  for (const [model, keywords] of Object.entries(CAR_MODELS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.carModel = model;
      break;
    }
  }

  // Year: 2000-2030
  const yearMatch = text.match(/\b(20[0-2]\d)\s*(yil|год|y|г)?\b/i) || text.match(/\b(20[0-2]\d)\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2000 && year <= 2030) result.carYear = year;
  }

  // Price: various formats ($25000, 25000$, 25 000 у.е., 250 mln, 25000 dollar)
  const pricePatterns = [
    /\$\s?([\d\s.,]+)/,
    /([\d\s.,]+)\s*\$/,
    /([\d\s.,]+)\s*(dollar|доллар|у\.?е\.?|usd)/i,
    /([\d\s.,]+)\s*(mln|млн|million)/i,
    /([\d\s.,]+)\s*(ming|тыс|тысяч)/i,
    /([\d\s.,]+)\s*(so'm|сум|sum|сўм)/i,
  ];

  for (const pattern of pricePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.carPrice = match[0].trim();
      break;
    }
  }

  // Color
  for (const [color, keywords] of Object.entries(COLOR_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.carColor = color;
      break;
    }
  }

  // Mileage: probeg, km
  const mileageMatch = text.match(/([\d\s.,]+)\s*(km|км|probeg|пробег)/i) ||
    text.match(/(probeg|пробег)\s*:?\s*([\d\s.,]+)/i);
  if (mileageMatch) {
    result.carMileage = mileageMatch[0].trim();
  }

  // Fuel
  for (const [fuel, keywords] of Object.entries(FUEL_TYPES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.carFuel = fuel;
      break;
    }
  }

  // Transmission
  for (const [trans, keywords] of Object.entries(TRANSMISSION_TYPES)) {
    if (keywords.some(kw => lower.includes(kw))) {
      result.carTransmission = trans;
      break;
    }
  }

  return result;
}
