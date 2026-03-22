/**
 * Telegram xabaridan mashina va egasi haqida ma'lumot ajratib olish
 * O'zbek, rus, ingliz tilidagi yozilishlar
 */

const CAR_BRANDS: Record<string, string[]> = {
  'Chevrolet': ['chevrolet', 'шевроле', 'шеви', 'chevralet', 'shevrole', 'shevrale'],
  'Daewoo': ['daewoo', 'дэу', 'деу', 'deu'],
  'Hyundai': ['hyundai', 'хюндай', 'хёндай', 'хундай', 'hundai', 'xundai', 'xyundai'],
  'Kia': ['kia', 'киа', 'кия'],
  'Toyota': ['toyota', 'тойота', 'тоёта', 'тайота', 'tayota'],
  'Lexus': ['lexus', 'лексус'],
  'BMW': ['bmw', 'бмв', 'бэмвэ'],
  'Mercedes': ['mercedes', 'мерседес', 'мерс', 'benz', 'mersedes'],
  'Audi': ['audi', 'ауди'],
  'Volkswagen': ['volkswagen', 'vw', 'фольксваген', 'folksvagen'],
  'Nissan': ['nissan', 'ниссан'],
  'Honda': ['honda', 'хонда'],
  'Mitsubishi': ['mitsubishi', 'митсубиси', 'митсубиши'],
  'Mazda': ['mazda', 'мазда'],
  'Ford': ['ford', 'форд'],
  'Opel': ['opel', 'опель'],
  'Renault': ['renault', 'рено'],
  'Skoda': ['skoda', 'шкода'],
  'Lada': ['lada', 'лада', 'ваз', 'vaz', 'жигули'],
  'BYD': ['byd', 'бид', 'бюд'],
  'Geely': ['geely', 'джили', 'jili'],
  'Chery': ['chery', 'чери', 'чэри'],
  'Haval': ['haval', 'хавал'],
  'JAC': ['jac', 'джак'],
  'Changan': ['changan', 'чанган'],
  'Jetour': ['jetour', 'жетур', 'джетур'],
  'Exeed': ['exeed', 'эксид', 'eksid'],
  'Ravon': ['ravon', 'равон'],
  'Isuzu': ['isuzu', 'исузу'],
  'MAN': ['man '],
  'Volvo': ['volvo', 'вольво'],
};

const CAR_MODELS: Record<string, string[]> = {
  'Gentra': ['gentra', 'гентра', 'jentira', 'gentira', 'jentra', 'джентра', 'jentira'],
  'Lacetti': ['lacetti', 'лачетти', 'лацетти', 'lasetti', 'лачети', 'лачетти'],
  'Malibu': ['malibu', 'малибу', 'malibi'],
  'Cobalt': ['cobalt', 'кобальт', 'kobalt'],
  'Nexia': ['nexia', 'нексия', 'nexia-3', 'нексия-3', 'neksia'],
  'Matiz': ['matiz', 'матиз'],
  'Spark': ['spark', 'спарк'],
  'Damas': ['damas', 'дамас'],
  'Labo': ['labo', 'лабо'],
  'Captiva': ['captiva', 'каптива', 'kaptiva'],
  'Tracker': ['tracker', 'трекер', 'тракер', 'treker'],
  'Equinox': ['equinox', 'эквинокс', 'ekvinoks'],
  'Tahoe': ['tahoe', 'тахо'],
  'Traverse': ['traverse', 'траверс'],
  'Onix': ['onix', 'оникс'],
  'Monza': ['monza', 'монза'],
  'Orlando': ['orlando', 'орландо'],
  'Epica': ['epica', 'эпика'],
  'Aveo': ['aveo', 'авео'],
  'Cruze': ['cruze', 'круз'],
  'Camry': ['camry', 'камри', 'кемри', 'kemri', 'kamri'],
  'Corolla': ['corolla', 'королла', 'karolla'],
  'RAV4': ['rav4', 'рав4', 'rav-4'],
  'Land Cruiser': ['land cruiser', 'ланд крузер', 'лк', 'lc', 'лэнд крузер'],
  'Prado': ['prado', 'прадо'],
  'Highlander': ['highlander', 'хайлендер', 'хайландер'],
  'Fortuner': ['fortuner', 'фортунер'],
  'Sonata': ['sonata', 'соната'],
  'Tucson': ['tucson', 'туксон', 'тусон', 'tukson'],
  'Accent': ['accent', 'акцент', 'солярис', 'solaris', 'aksent'],
  'Elantra': ['elantra', 'элантра', 'elantr'],
  'Santa Fe': ['santa fe', 'санта фе', 'сантафе', 'santafe'],
  'Rio': ['rio', 'рио'],
  'K5': ['k5', 'к5'],
  'Sportage': ['sportage', 'спортаж', 'спортейдж'],
  'Sorento': ['sorento', 'соренто'],
  'R4': ['r4', 'р4'],
  'R3': ['r3', 'р3'],
};

const FUEL_TYPES: Record<string, string[]> = {
  'Benzin': ['benzin', 'бензин', 'бензинли'],
  'Dizel': ['dizel', 'diesel', 'дизель', 'дизел'],
  'Gaz': ['gaz', 'газ', 'метан', 'metan', 'propan', 'пропан', 'metan gaz', 'benzin metan'],
  'Gibrid': ['gibrid', 'hybrid', 'гибрид'],
  'Elektr': ['elektr', 'electr', 'электро', 'ev'],
};

const TRANSMISSION_TYPES: Record<string, string[]> = {
  'Avtomat': ['avtomat', 'автомат', 'automatic', 'акпп', 'at', 'avtomat karobka'],
  'Mexanika': ['mexanika', 'механика', 'manual', 'мкпп', 'mt', 'mexan', 'pozitsa'],
  'Tiptronik': ['tiptronik', 'типтроник'],
  'Variator': ['variator', 'вариатор', 'cvt'],
};

const COLOR_KEYWORDS: Record<string, string[]> = {
  'Oq': ['oq', 'белый', 'white', 'ок ранг', 'oq rang'],
  'Qora': ['qora', 'черный', 'black', 'чёрный', 'kora'],
  'Kumush': ['kumush', 'серебристый', 'silver', 'серый', 'kulrang', 'kumish'],
  'Ko\'k': ['kok', "ko'k", 'синий', 'blue', 'голубой'],
  'Qizil': ['qizil', 'красный', 'red'],
  'Yashil': ['yashil', 'зеленый', 'green'],
  'Sariq': ['sariq', 'желтый', 'yellow'],
  'Olcha': ['olcha', 'вишневый', 'бордо', 'bordo'],
  'Bronza': ['bronza', 'бронза', 'bronze', 'bronz'],
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

// So'z chegarasi bilan tekshirish - "tahalla" ichidan "lada" topmasligi uchun
function matchWord(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?:^|[\\s,;:.!?()\\-/])${escaped}(?:$|[\\s,;:.!?()\\-/])`, 'i');
  return regex.test(text);
}

export function parseCarMessage(text: string): ParsedMessage {
  const empty: ParsedMessage = { carBrand: null, carModel: null, carYear: null, carPrice: null, carColor: null, carMileage: null, carFuel: null, carTransmission: null, carDescription: null };
  if (!text) return empty;

  const lower = ' ' + text.toLowerCase() + ' ';
  const result: ParsedMessage = { ...empty, carDescription: text.substring(0, 500) };

  // Brand
  for (const [brand, keywords] of Object.entries(CAR_BRANDS)) {
    if (keywords.some(kw => matchWord(lower, kw))) {
      result.carBrand = brand;
      break;
    }
  }

  // Model
  for (const [model, keywords] of Object.entries(CAR_MODELS)) {
    if (keywords.some(kw => matchWord(lower, kw))) {
      result.carModel = model;
      // Brand auto-detect from model
      if (!result.carBrand) {
        if (['Gentra', 'Lacetti', 'Malibu', 'Cobalt', 'Nexia', 'Matiz', 'Spark', 'Damas', 'Labo', 'Captiva', 'Tracker', 'Equinox', 'Tahoe', 'Traverse', 'Onix', 'Monza', 'Orlando', 'Epica', 'Aveo', 'Cruze'].includes(model)) {
          result.carBrand = 'Chevrolet';
        } else if (['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Prado', 'Highlander', 'Fortuner'].includes(model)) {
          result.carBrand = 'Toyota';
        } else if (['Sonata', 'Tucson', 'Accent', 'Elantra', 'Santa Fe'].includes(model)) {
          result.carBrand = 'Hyundai';
        } else if (['Rio', 'K5', 'Sportage', 'Sorento'].includes(model)) {
          result.carBrand = 'Kia';
        } else if (['R4', 'R3'].includes(model)) {
          result.carBrand = 'Ravon';
        }
      }
      break;
    }
  }

  // Year: 2000-2030
  const yearMatch = text.match(/\b(20[0-2]\d)\s*(yil|год|y|г|yili)?\b/i);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2000 && year <= 2030) result.carYear = year;
  }

  // Price
  const pricePatterns = [
    /(\d[\d\s.,]*)\s*\$/,
    /\$\s*(\d[\d\s.,]*)/,
    /(\d[\d\s.,]*)\s*(dollar|доллар|у\.?е\.?|usd)/i,
    /narxi?\s*:?\s*(\d[\d\s.,]*)\s*\$?/i,
    /нарх[иа]?\s*:?\s*(\d[\d\s.,]*)/i,
    /(\d[\d\s.,]*)\s*(mln|млн)/i,
    /(\d[\d\s.,]*)\s*(so'm|сум|sum)/i,
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
    if (keywords.some(kw => matchWord(lower, kw))) {
      result.carColor = color;
      break;
    }
  }

  // Mileage - "prabeg", "probeg", "km", "yurgan"
  const mileagePatterns = [
    /(prabeg|probeg|пробег)\s*[:\-]?\s*([\d\s.,]+)\s*(km|км)?/i,
    /([\d\s.,]+)\s*(km|км)/i,
    /(yurgan|юрган)\s*[:\-]?\s*([\d\s.,]+)/i,
  ];
  for (const pattern of mileagePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.carMileage = match[0].trim();
      break;
    }
  }

  // Fuel
  for (const [fuel, keywords] of Object.entries(FUEL_TYPES)) {
    if (keywords.some(kw => matchWord(lower, kw))) {
      result.carFuel = fuel;
      break;
    }
  }

  // Transmission
  for (const [trans, keywords] of Object.entries(TRANSMISSION_TYPES)) {
    if (keywords.some(kw => matchWord(lower, kw))) {
      result.carTransmission = trans;
      break;
    }
  }

  return result;
}
