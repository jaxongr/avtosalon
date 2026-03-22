/**
 * Telegram xabaridan mashina va egasi haqida ma'lumot ajratib olish
 * O'zbek, rus, ingliz tilidagi yozilishlar
 */

const CAR_BRANDS: Record<string, string[]> = {
  'Chevrolet': ['chevrolet', 'шевроле', 'шеви', 'chevralet', 'shevrole', 'shevrale', 'chevrale', 'shevrolet'],
  'Daewoo': ['daewoo', 'дэу', 'деу', 'deu', 'деуу'],
  'Hyundai': ['hyundai', 'хюндай', 'хёндай', 'хундай', 'hundai', 'xundai', 'xyundai', 'xunday', 'хендай', 'хенде'],
  'Kia': ['kia', 'киа', 'кия', 'кио'],
  'Toyota': ['toyota', 'тойота', 'тоёта', 'тайота', 'tayota', 'тоета', 'тоиота'],
  'Lexus': ['lexus', 'лексус', 'leksus'],
  'BMW': ['bmw', 'бмв', 'бэмвэ', 'бмвшка'],
  'Mercedes': ['mercedes', 'мерседес', 'мерс', 'benz', 'mersedes', 'мерин', 'мерцедес'],
  'Audi': ['audi', 'ауди', 'авди'],
  'Volkswagen': ['volkswagen', 'vw', 'фольксваген', 'folksvagen', 'фолксваген'],
  'Nissan': ['nissan', 'ниссан', 'нисан'],
  'Honda': ['honda', 'хонда', 'xonda'],
  'Mitsubishi': ['mitsubishi', 'митсубиси', 'митсубиши', 'mitsubisi'],
  'Mazda': ['mazda', 'мазда'],
  'Ford': ['ford', 'форд'],
  'Opel': ['opel', 'опель'],
  'Renault': ['renault', 'рено', 'рeно'],
  'Skoda': ['skoda', 'шкода', 'shkoda'],
  'Lada': ['lada', 'лада', 'ваз', 'vaz', 'жигули', 'jiguli'],
  'BYD': ['byd', 'бид', 'бюд', 'бyд'],
  'Geely': ['geely', 'джили', 'jili', 'жили', 'gili'],
  'Chery': ['chery', 'чери', 'чэри', 'cheri'],
  'Haval': ['haval', 'хавал', 'хавол', 'xaval'],
  'JAC': ['jac', 'джак', 'жак'],
  'Changan': ['changan', 'чанган', 'чанан'],
  'Jetour': ['jetour', 'жетур', 'джетур', 'jetour'],
  'Exeed': ['exeed', 'эксид', 'eksid', 'иксид'],
  'Ravon': ['ravon', 'равон'],
  'Isuzu': ['isuzu', 'исузу', 'изузу'],
  'MAN': ['man '],
  'Volvo': ['volvo', 'вольво'],
  'Tesla': ['tesla', 'тесла'],
  'Porsche': ['porsche', 'порше', 'порш'],
  'Peugeot': ['peugeot', 'пежо', 'pejo'],
  'Subaru': ['subaru', 'субару'],
  'Suzuki': ['suzuki', 'сузуки'],
  'Dongfeng': ['dongfeng', 'донгфенг', 'донфенг'],
  'GAZ': ['газель', 'gazel', 'газ '],
  'UAZ': ['уаз', 'uaz'],
  'Tank': ['tank ', 'танк '],
  'Great Wall': ['great wall', 'грейт волл'],
  'BAIC': ['baic', 'баик'],
  'FAW': ['faw', 'фав'],
  'Zeekr': ['zeekr', 'зикр'],
  'Li Auto': ['li auto', 'ли авто'],
  'Hongqi': ['hongqi', 'хонки', 'хунки'],
};

const CAR_MODELS: Record<string, string[]> = {
  // Chevrolet / Daewoo
  'Gentra': ['gentra', 'гентра', 'jentira', 'gentira', 'jentra', 'джентра', 'жентра', 'гентира'],
  'Lacetti': ['lacetti', 'лачетти', 'лацетти', 'lasetti', 'лачети', 'лачетти', 'lachetti', 'лачетi', 'latsetti'],
  'Malibu': ['malibu', 'малибу', 'malibi', 'malbu', 'малибy', 'малибю'],
  'Cobalt': ['cobalt', 'кобальт', 'kobalt', 'кобалт', 'кобольт', 'кoбальт'],
  'Nexia': ['nexia', 'нексия', 'nexia-3', 'нексия-3', 'neksia', 'нехия', 'nexia3', 'нексия3', 'neksia3'],
  'Matiz': ['matiz', 'матиз', 'матис'],
  'Spark': ['spark', 'спарк', 'sparк'],
  'Damas': ['damas', 'дамас', 'dammas', 'дамаc'],
  'Labo': ['labo', 'лабо'],
  'Captiva': ['captiva', 'каптива', 'kaptiva', 'каптиво'],
  'Tracker': ['tracker', 'трекер', 'тракер', 'treker', 'тракёр'],
  'Equinox': ['equinox', 'эквинокс', 'ekvinoks', 'эквинос'],
  'Tahoe': ['tahoe', 'тахо', 'тахое'],
  'Traverse': ['traverse', 'траверс', 'траверз'],
  'Trailblazer': ['trailblazer', 'трейлблейзер', 'трэйлблэйзер', 'treylbleyzer'],
  'Onix': ['onix', 'оникс', 'онис'],
  'Monza': ['monza', 'монза'],
  'Orlando': ['orlando', 'орландо'],
  'Epica': ['epica', 'эпика'],
  'Aveo': ['aveo', 'авео'],
  'Cruze': ['cruze', 'круз', 'крузе'],
  // Toyota
  'Camry': ['camry', 'камри', 'кемри', 'kemri', 'kamri', 'кэмри', 'kamry'],
  'Corolla': ['corolla', 'королла', 'karolla', 'королла', 'корола'],
  'RAV4': ['rav4', 'рав4', 'rav-4', 'рав 4', 'rav 4'],
  'Land Cruiser': ['land cruiser', 'ланд крузер', 'лк', 'lc', 'лэнд крузер', 'ландкрузер', 'land kruser', 'land kruzer'],
  'Prado': ['prado', 'прадо', 'прада'],
  'Highlander': ['highlander', 'хайлендер', 'хайландер', 'хайлэндер'],
  'Fortuner': ['fortuner', 'фортунер', 'фортюнер'],
  'Hilux': ['hilux', 'хайлюкс', 'хайлукс', 'хилукс'],
  'Yaris': ['yaris', 'ярис'],
  'Crown': ['crown', 'краун'],
  'Alphard': ['alphard', 'альфард', 'алфард'],
  // Hyundai
  'Sonata': ['sonata', 'соната', 'сонато'],
  'Tucson': ['tucson', 'туксон', 'тусон', 'tukson', 'тукcон', 'тюксон', 'тюсон'],
  'Accent': ['accent', 'акцент', 'солярис', 'solaris', 'aksent', 'аксент'],
  'Elantra': ['elantra', 'элантра', 'elantr', 'элантро'],
  'Santa Fe': ['santa fe', 'санта фе', 'сантафе', 'santafe', 'санта-фе'],
  'Creta': ['creta', 'крета', 'кретa'],
  'Palisade': ['palisade', 'палисад', 'палисейд'],
  'Grandeur': ['grandeur', 'грандер', 'грандёр'],
  // Kia
  'Rio': ['rio', 'рио'],
  'K5': ['k5', 'к5', 'k-5'],
  'K3': ['k3', 'к3', 'k-3'],
  'Cerato': ['cerato', 'церато', 'серато', 'cerато'],
  'Sportage': ['sportage', 'спортаж', 'спортейдж', 'спортейж', 'sportaj'],
  'Sorento': ['sorento', 'соренто', 'сорэнто'],
  'Seltos': ['seltos', 'селтос', 'сельтос'],
  'Carnival': ['carnival', 'карнивал'],
  // Ravon
  'R4': ['r4', 'р4', 'r-4'],
  'R3': ['r3', 'р3', 'r-3'],
  'R2': ['r2', 'р2', 'r-2'],
  // Lada
  'Vesta': ['vesta', 'веста'],
  'Granta': ['granta', 'гранта'],
  'Niva': ['niva', 'нива'],
  'Priora': ['priora', 'приора'],
  'Largus': ['largus', 'ларгус'],
  // BYD
  'Song Plus': ['song plus', 'сонг плюс', 'сонг плас', 'song+', 'songplus'],
  'Song': ['song ', 'сонг '],
  'Han': ['han ', 'хан '],
  'Tang': ['tang ', 'танг '],
  'Qin': ['qin', 'чин'],
  'Seal': ['seal', 'сеал', 'сил'],
  'Dolphin': ['dolphin', 'дольфин', 'дельфин'],
  'Atto 3': ['atto 3', 'атто 3', 'atto3', 'атто3'],
  // Geely
  'Monjaro': ['monjaro', 'монжаро', 'monjаro'],
  'Coolray': ['coolray', 'кулрей', 'кулрэй', 'kulrey', 'coolrey'],
  'Atlas': ['atlas', 'атлас'],
  'Emgrand': ['emgrand', 'эмгранд', 'емгранд'],
  // Chery
  'Tiggo 4': ['tiggo 4', 'тигго 4', 'tiggo4', 'тигго4'],
  'Tiggo 7': ['tiggo 7', 'тигго 7', 'tiggo7', 'тигго7'],
  'Tiggo 8': ['tiggo 8', 'тигго 8', 'tiggo8', 'тигго8'],
  'Tiggo': ['tiggo', 'тигго'],
  'Arrizo': ['arrizo', 'арризо', 'aризо'],
  // Haval
  'Jolion': ['jolion', 'жолион', 'джолион', 'jolian'],
  'H6': ['h6', 'х6', 'h-6'],
  'F7': ['f7', 'ф7', 'f-7'],
  'Dargo': ['dargo', 'дарго'],
  // Jetour
  'X70': ['x70', 'х70', 'x-70'],
  'Dashing': ['dashing', 'дашинг', 'дэшинг'],
  'T2': ['t2', 'т2'],
  // Changan
  'CS35': ['cs35', 'цс35', 'cs-35'],
  'CS55': ['cs55', 'цс55', 'cs-55'],
  'CS75': ['cs75', 'цс75', 'cs-75'],
  'UNI-T': ['uni-t', 'юни-т', 'unit', 'юнит'],
  'UNI-V': ['uni-v', 'юни-в', 'univ', 'юнив'],
  // Exeed
  'VX': ['vx ', 'вх '],
  'LX': ['lx ', 'лх '],
  'TXL': ['txl', 'тхл'],
  // Dongfeng
  'ix35': ['ix35', 'их35', 'ix-35'],
  // Mercedes
  'E-Class': ['e-class', 'е-класс', 'e class', 'e200', 'e220', 'e300', 'е200', 'е220', 'е300', 'e250'],
  'C-Class': ['c-class', 'с-класс', 'c class', 'c200', 'c180', 'c300', 'с200', 'с180', 'с300', 'c250'],
  'S-Class': ['s-class', 'с-класс', 's class', 's500', 's350', 'с500', 'с350'],
  'GLE': ['gle', 'гле'],
  'GLC': ['glc', 'глц'],
  'Sprinter': ['sprinter', 'спринтер'],
  // BMW
  'X5': ['x5', 'х5', 'x-5', 'икс5'],
  'X3': ['x3', 'х3', 'x-3'],
  'X7': ['x7', 'х7', 'x-7'],
  // Nissan
  'Pathfinder': ['pathfinder', 'патфайндер', 'пасфайндер'],
  'X-Trail': ['x-trail', 'х-трейл', 'хтрейл', 'xtrail'],
  'Qashqai': ['qashqai', 'кашкай', 'кашкаи'],
  // Others
  'Duster': ['duster', 'дастер', 'дустер'],
  'Logan': ['logan', 'логан'],
  'Polo': ['polo ', 'поло '],
  'Tiguan': ['tiguan', 'тигуан'],
  'Jetta': ['jetta', 'джетта', 'жетта'],
  'Passat': ['passat', 'пассат'],
  'Focus': ['focus', 'фокус'],
  'Outlander': ['outlander', 'аутлендер', 'аутландер'],
  'CX-5': ['cx-5', 'cx5', 'сх-5', 'сх5'],
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

  // Unicode apostroflarni normalize qilish (Telegram'da ʻ ʼ ' ' ishlatiladi)
  const normalized = text.replace(/[\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'");
  const lower = ' ' + normalized.toLowerCase() + ' ';
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
        const modelToBrand: Record<string, string> = {
          // Chevrolet
          'Gentra': 'Chevrolet', 'Lacetti': 'Chevrolet', 'Malibu': 'Chevrolet', 'Cobalt': 'Chevrolet',
          'Nexia': 'Chevrolet', 'Matiz': 'Chevrolet', 'Spark': 'Chevrolet', 'Damas': 'Chevrolet',
          'Labo': 'Chevrolet', 'Captiva': 'Chevrolet', 'Tracker': 'Chevrolet', 'Equinox': 'Chevrolet',
          'Tahoe': 'Chevrolet', 'Traverse': 'Chevrolet', 'Trailblazer': 'Chevrolet', 'Onix': 'Chevrolet',
          'Monza': 'Chevrolet', 'Orlando': 'Chevrolet', 'Epica': 'Chevrolet', 'Aveo': 'Chevrolet', 'Cruze': 'Chevrolet',
          // Toyota
          'Camry': 'Toyota', 'Corolla': 'Toyota', 'RAV4': 'Toyota', 'Land Cruiser': 'Toyota',
          'Prado': 'Toyota', 'Highlander': 'Toyota', 'Fortuner': 'Toyota', 'Hilux': 'Toyota',
          'Yaris': 'Toyota', 'Crown': 'Toyota', 'Alphard': 'Toyota',
          // Hyundai
          'Sonata': 'Hyundai', 'Tucson': 'Hyundai', 'Accent': 'Hyundai', 'Elantra': 'Hyundai',
          'Santa Fe': 'Hyundai', 'Creta': 'Hyundai', 'Palisade': 'Hyundai', 'Grandeur': 'Hyundai',
          // Kia
          'Rio': 'Kia', 'K5': 'Kia', 'K3': 'Kia', 'Cerato': 'Kia', 'Sportage': 'Kia',
          'Sorento': 'Kia', 'Seltos': 'Kia', 'Carnival': 'Kia',
          // Ravon
          'R4': 'Ravon', 'R3': 'Ravon', 'R2': 'Ravon',
          // Lada
          'Vesta': 'Lada', 'Granta': 'Lada', 'Niva': 'Lada', 'Priora': 'Lada', 'Largus': 'Lada',
          // BYD
          'Song Plus': 'BYD', 'Song': 'BYD', 'Han': 'BYD', 'Tang': 'BYD', 'Qin': 'BYD',
          'Seal': 'BYD', 'Dolphin': 'BYD', 'Atto 3': 'BYD',
          // Geely
          'Monjaro': 'Geely', 'Coolray': 'Geely', 'Atlas': 'Geely', 'Emgrand': 'Geely',
          // Chery
          'Tiggo 4': 'Chery', 'Tiggo 7': 'Chery', 'Tiggo 8': 'Chery', 'Tiggo': 'Chery', 'Arrizo': 'Chery',
          // Haval
          'Jolion': 'Haval', 'H6': 'Haval', 'F7': 'Haval', 'Dargo': 'Haval',
          // Jetour
          'X70': 'Jetour', 'Dashing': 'Jetour', 'T2': 'Jetour',
          // Changan
          'CS35': 'Changan', 'CS55': 'Changan', 'CS75': 'Changan', 'UNI-T': 'Changan', 'UNI-V': 'Changan',
          // Exeed
          'VX': 'Exeed', 'LX': 'Exeed', 'TXL': 'Exeed',
          // Mercedes
          'E-Class': 'Mercedes', 'C-Class': 'Mercedes', 'S-Class': 'Mercedes',
          'GLE': 'Mercedes', 'GLC': 'Mercedes', 'Sprinter': 'Mercedes',
          // BMW
          'X5': 'BMW', 'X3': 'BMW', 'X7': 'BMW',
          // Nissan
          'Pathfinder': 'Nissan', 'X-Trail': 'Nissan', 'Qashqai': 'Nissan',
          // Renault
          'Duster': 'Renault', 'Logan': 'Renault',
          // VW
          'Polo': 'Volkswagen', 'Tiguan': 'Volkswagen', 'Jetta': 'Volkswagen', 'Passat': 'Volkswagen',
          // Ford
          'Focus': 'Ford',
          // Mitsubishi
          'Outlander': 'Mitsubishi',
          // Mazda
          'CX-5': 'Mazda',
        };
        if (modelToBrand[model]) {
          result.carBrand = modelToBrand[model];
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
