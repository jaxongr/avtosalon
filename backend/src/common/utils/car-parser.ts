import { ParsedCarData } from '../interfaces/parsed-car-data.interface';

function normalizeText(text: string): string {
  return text
    .replace(/[\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'")
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '') // zero-width chars
    .replace(/\*\*/g, '')
    .replace(/#+/g, ' ')
    .replace(/__/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface BrandModelEntry {
  brand: string;
  aliases: string[];
  models: { name: string; aliases: string[] }[];
}

const BRAND_MODEL_DB: BrandModelEntry[] = [
  {
    brand: 'Chevrolet',
    aliases: ['chevrolet', 'shevrolet', 'shevralet', 'шевроле'],
    models: [
      { name: 'Cobalt', aliases: ['cobalt', 'kobalt', 'sobult', 'кобальт', 'кобалт'] },
      { name: 'Malibu', aliases: ['malibu', 'malibu 1', 'maliby', 'malib', 'малибу'] },
      { name: 'Malibu 2', aliases: ['malibu 2', 'malibu2', 'малибу 2'] },
      { name: 'Gentra', aliases: ['gentra', 'гентра', 'жентра', 'jentra'] },
      { name: 'Lacetti', aliases: ['lacetti', 'lasetti', 'lachetti', 'лачетти', 'лацетти', 'ласетти', 'ласети', 'лацети'] },
      { name: 'Nexia', aliases: ['nexia', 'nexia 3', 'nexia3', 'nexia 2', 'nexia2', 'nexia 1', 'nexia1', 'нексия', 'нексиа'] },
      { name: 'Damas', aliases: ['damas', 'дамас'] },
      { name: 'Labo', aliases: ['labo', 'лабо'] },
      { name: 'Spark', aliases: ['spark', 'спарк'] },
      { name: 'Captiva', aliases: ['captiva', 'kaptiva', 'каптива'] },
      { name: 'Tracker', aliases: ['tracker', 'treker', 'трекер', 'тракер', 'треккер'] },
      { name: 'Tracker 2', aliases: ['tracker 2', 'treker 2', 'трекер 2', 'треккер 2', 'треккер2'] },
      { name: 'Equinox', aliases: ['equinox', 'эквинокс'] },
      { name: 'Onix', aliases: ['onix', 'оникс'] },
      { name: 'Monza', aliases: ['monza', 'монза'] },
      { name: 'Orlando', aliases: ['orlando', 'орландо'] },
      { name: 'Traverse', aliases: ['traverse', 'траверс'] },
      { name: 'Tahoe', aliases: ['tahoe', 'тахо'] },
      { name: 'Epica', aliases: ['epica', 'эпика'] },
      { name: 'Cruze', aliases: ['cruze', 'круз'] },
      { name: 'Aveo', aliases: ['aveo', 'авео'] },
      { name: 'Matiz', aliases: ['matiz', 'матиз'] },
      { name: 'Tico', aliases: ['tico', 'tiko', 'тико'] },
    ],
  },
  {
    brand: 'Toyota',
    aliases: ['toyota', 'tayota', 'тойота'],
    models: [
      { name: 'Camry', aliases: ['camry', 'kamri', 'kambri', 'камри', 'кэмри'] },
      { name: 'Corolla', aliases: ['corolla', 'королла', 'каролла'] },
      { name: 'Land Cruiser', aliases: ['land cruiser', 'cruiser', 'ленд крузер', 'лэнд крузер', 'крузер'] },
      { name: 'Prado', aliases: ['prado', 'прадо'] },
      { name: 'RAV4', aliases: ['rav4', 'rav 4', 'рав4'] },
      { name: 'Hilux', aliases: ['hilux', 'хайлюкс'] },
      { name: 'Avalon', aliases: ['avalon', 'авалон'] },
      { name: 'Yaris', aliases: ['yaris', 'ярис'] },
      { name: 'Crown', aliases: ['crown', 'краун'] },
      { name: 'Fortuner', aliases: ['fortuner', 'фортунер'] },
      { name: 'Highlander', aliases: ['highlander', 'хайлендер'] },
    ],
  },
  {
    brand: 'Hyundai',
    aliases: ['hyundai', 'hundai', 'xundai', 'хендай', 'хундай', 'хёндай'],
    models: [
      { name: 'Sonata', aliases: ['sonata', 'соната'] },
      { name: 'Tucson', aliases: ['tucson', 'tukson', 'тусон', 'туксон'] },
      { name: 'Elantra', aliases: ['elantra', 'элантра'] },
      { name: 'Accent', aliases: ['accent', 'aksent', 'акцент'] },
      { name: 'Santa Fe', aliases: ['santa fe', 'santafe', 'санта фе'] },
      { name: 'Creta', aliases: ['creta', 'крета'] },
      { name: 'Palisade', aliases: ['palisade', 'палисад'] },
      { name: 'Porter', aliases: ['porter', 'портер'] },
      { name: 'Venue', aliases: ['venue', 'венью'] },
    ],
  },
  {
    brand: 'Kia',
    aliases: ['kia', 'киа', 'кия'],
    models: [
      { name: 'K5', aliases: ['k5'] },
      { name: 'K7', aliases: ['k7'] },
      { name: 'Sportage', aliases: ['sportage'] },
      { name: 'Seltos', aliases: ['seltos'] },
      { name: 'Carnival', aliases: ['carnival'] },
      { name: 'Cerato', aliases: ['cerato'] },
      { name: 'Optima', aliases: ['optima'] },
      { name: 'Rio', aliases: ['rio'] },
      { name: 'Sorento', aliases: ['sorento'] },
    ],
  },
  {
    brand: 'BYD',
    aliases: ['byd', 'бид'],
    models: [
      { name: 'Song Plus', aliases: ['song plus', 'song+'] },
      { name: 'Song Pro', aliases: ['song pro'] },
      { name: 'Han', aliases: ['han'] },
      { name: 'Tang', aliases: ['tang'] },
      { name: 'Seal', aliases: ['seal'] },
      { name: 'Dolphin', aliases: ['dolphin'] },
      { name: 'Atto 3', aliases: ['atto 3', 'atto3'] },
      { name: 'Chazor', aliases: ['chazor'] },
    ],
  },
  {
    brand: 'Geely',
    aliases: ['geely', 'джили', 'жили'],
    models: [
      { name: 'Monjaro', aliases: ['monjaro'] },
      { name: 'Coolray', aliases: ['coolray'] },
      { name: 'Atlas', aliases: ['atlas'] },
      { name: 'Emgrand', aliases: ['emgrand'] },
      { name: 'Tugella', aliases: ['tugella'] },
    ],
  },
  {
    brand: 'Chery',
    aliases: ['chery', 'cheri', 'чери', 'черри'],
    models: [
      { name: 'Tiggo 4 Pro', aliases: ['tiggo 4 pro'] },
      { name: 'Tiggo 7 Pro', aliases: ['tiggo 7 pro'] },
      { name: 'Tiggo 8 Pro', aliases: ['tiggo 8 pro'] },
      { name: 'Tiggo 4', aliases: ['tiggo 4', 'tiggo4'] },
      { name: 'Tiggo 7', aliases: ['tiggo 7', 'tiggo7'] },
      { name: 'Tiggo 8', aliases: ['tiggo 8', 'tiggo8'] },
      { name: 'Arrizo 6', aliases: ['arrizo 6', 'arizo 6'] },
      { name: 'ARZ-6', aliases: ['arz-6', 'arz6'] },
    ],
  },
  {
    brand: 'Haval',
    aliases: ['haval', 'хавал', 'хавейл'],
    models: [
      { name: 'Jolion', aliases: ['jolion'] },
      { name: 'Dargo', aliases: ['dargo'] },
      { name: 'H6', aliases: ['h6'] },
      { name: 'F7', aliases: ['f7'] },
    ],
  },
  {
    brand: 'Lada',
    aliases: ['lada', 'vaz', 'лада', 'ваз'],
    models: [
      { name: 'Vesta', aliases: ['vesta'] },
      { name: 'Granta', aliases: ['granta'] },
      { name: 'Niva', aliases: ['niva'] },
      { name: 'Priora', aliases: ['priora'] },
    ],
  },
  {
    brand: 'Mercedes-Benz',
    aliases: ['mercedes', 'mersedes', 'benz', 'мерседес', 'мерс'],
    models: [
      { name: 'S-Class', aliases: ['s class', 's-class', 's500', 's550'] },
      { name: 'E-Class', aliases: ['e class', 'e-class', 'e200', 'e220', 'e300'] },
      { name: 'C-Class', aliases: ['c class', 'c-class', 'c200', 'c180'] },
      { name: 'Sprinter', aliases: ['sprinter'] },
    ],
  },
  {
    brand: 'BMW',
    aliases: ['bmw', 'бмв'],
    models: [
      { name: 'X5', aliases: ['x5'] },
      { name: 'X3', aliases: ['x3'] },
      { name: 'X7', aliases: ['x7'] },
      { name: '5 Series', aliases: ['520', '525', '528', '530', '535', '540'] },
      { name: '7 Series', aliases: ['730', '735', '740', '750'] },
    ],
  },
  {
    brand: 'Volkswagen',
    aliases: ['volkswagen', 'vw', 'фольксваген'],
    models: [
      { name: 'Tiguan', aliases: ['tiguan'] },
      { name: 'Passat', aliases: ['passat'] },
      { name: 'Polo', aliases: ['polo'] },
      { name: 'Jetta', aliases: ['jetta'] },
      { name: 'Golf', aliases: ['golf'] },
      { name: 'Touareg', aliases: ['touareg'] },
    ],
  },
  {
    brand: 'Nissan',
    aliases: ['nissan', 'ниссан'],
    models: [
      { name: 'X-Trail', aliases: ['x-trail', 'x trail'] },
      { name: 'Qashqai', aliases: ['qashqai'] },
      { name: 'Pathfinder', aliases: ['pathfinder'] },
      { name: 'Patrol', aliases: ['patrol'] },
    ],
  },
  {
    brand: 'Honda',
    aliases: ['honda'],
    models: [
      { name: 'CR-V', aliases: ['cr-v', 'crv'] },
      { name: 'Civic', aliases: ['civic'] },
      { name: 'Accord', aliases: ['accord'] },
    ],
  },
  {
    brand: 'Mitsubishi',
    aliases: ['mitsubishi'],
    models: [
      { name: 'Outlander', aliases: ['outlander'] },
      { name: 'Pajero', aliases: ['pajero'] },
      { name: 'L200', aliases: ['l200'] },
      { name: 'Lancer', aliases: ['lancer'] },
    ],
  },
  {
    brand: 'Moskvich',
    aliases: ['moskvich', 'moskivich', 'москвич'],
    models: [
      { name: '412', aliases: ['412pikap', '412'] },
      { name: '2141', aliases: ['2141'] },
    ],
  },
  {
    brand: 'GAZ',
    aliases: ['газель'],
    models: [
      { name: 'Gazelle', aliases: ['gazelle', 'gazel', 'газель'] },
      { name: '3110', aliases: ['3110', 'волга'] },
    ],
  },
  {
    brand: 'Jetour',
    aliases: ['jetour', 'жетур', 'джетур'],
    models: [
      { name: 'Dashing', aliases: ['dashing', 'дашинг'] },
      { name: 'X70', aliases: ['x70'] },
    ],
  },
  {
    brand: 'Exeed',
    aliases: ['exeed', 'эксид'],
    models: [
      { name: 'VX', aliases: ['vx'] },
      { name: 'LX', aliases: ['lx'] },
      { name: 'TXL', aliases: ['txl'] },
    ],
  },
  {
    brand: 'Bestune',
    aliases: ['bestune', 'бестун', 'bestun'],
    models: [
      { name: 'T77', aliases: ['t77', 'т77'] },
      { name: 'T99', aliases: ['t99'] },
      { name: 'B70', aliases: ['b70'] },
    ],
  },
  {
    brand: 'GAC',
    aliases: ['gac', 'гак'],
    models: [
      { name: 'Aion V', aliases: ['aion v', 'аион'] },
      { name: 'Aion S', aliases: ['aion s'] },
      { name: 'GS8', aliases: ['gs8'] },
    ],
  },
  {
    brand: 'Changan',
    aliases: ['changan', 'чанган'],
    models: [
      { name: 'CS35', aliases: ['cs35'] },
      { name: 'CS55', aliases: ['cs55'] },
      { name: 'CS75', aliases: ['cs75'] },
      { name: 'UNI-V', aliases: ['uni-v', 'uni v'] },
      { name: 'UNI-K', aliases: ['uni-k', 'uni k'] },
    ],
  },
  {
    brand: 'Lexus',
    aliases: ['lexus', 'лексус'],
    models: [
      { name: 'RX', aliases: ['rx350', 'rx300', 'rx'] },
      { name: 'LX', aliases: ['lx570', 'lx600'] },
      { name: 'ES', aliases: ['es350', 'es300'] },
      { name: 'GX', aliases: ['gx460', 'gx470'] },
    ],
  },
  {
    brand: 'Audi',
    aliases: ['audi', 'ауди'],
    models: [
      { name: 'A4', aliases: ['a4'] },
      { name: 'A6', aliases: ['a6'] },
      { name: 'Q5', aliases: ['q5'] },
      { name: 'Q7', aliases: ['q7'] },
    ],
  },
  {
    brand: 'Ford',
    aliases: ['ford', 'форд'],
    models: [
      { name: 'Explorer', aliases: ['explorer', 'эксплорер'] },
      { name: 'Focus', aliases: ['focus', 'фокус'] },
      { name: 'Mustang', aliases: ['mustang', 'мустанг'] },
      { name: 'Transit', aliases: ['transit', 'транзит'] },
    ],
  },
  {
    brand: 'Subaru',
    aliases: ['subaru', 'субару'],
    models: [
      { name: 'Forester', aliases: ['forester', 'форестер'] },
      { name: 'Outback', aliases: ['outback', 'аутбек'] },
      { name: 'Legacy', aliases: ['legacy', 'легаси'] },
    ],
  },
  {
    brand: 'Mazda',
    aliases: ['mazda', 'мазда'],
    models: [
      { name: 'CX-5', aliases: ['cx-5', 'cx5'] },
      { name: 'CX-9', aliases: ['cx-9', 'cx9'] },
      { name: '6', aliases: ['mazda 6', 'мазда 6'] },
    ],
  },
  {
    brand: 'Suzuki',
    aliases: ['suzuki', 'сузуки'],
    models: [
      { name: 'Vitara', aliases: ['vitara', 'витара'] },
      { name: 'SX4', aliases: ['sx4'] },
      { name: 'Swift', aliases: ['swift'] },
    ],
  },
  {
    brand: 'UAZ',
    aliases: ['uaz', 'уаз'],
    models: [
      { name: 'Patriot', aliases: ['patriot', 'патриот'] },
      { name: 'Hunter', aliases: ['hunter', 'хантер'] },
    ],
  },
  {
    brand: 'KAMAZ',
    aliases: ['kamaz', 'камаз'],
    models: [],
  },
  {
    brand: 'Isuzu',
    aliases: ['isuzu', 'исузу'],
    models: [
      { name: 'NQR', aliases: ['nqr'] },
      { name: 'Elf', aliases: ['elf'] },
    ],
  },
  {
    brand: 'MAN',
    aliases: ['man'],
    models: [],
  },
  {
    brand: 'Belarus',
    aliases: ['belarus', 'беларус'],
    models: [
      { name: '82', aliases: ['82.1'] },
      { name: '892', aliases: ['892'] },
      { name: '920', aliases: ['920'] },
    ],
  },
  {
    brand: 'Hongqi',
    aliases: ['hongqi', 'хонгки', 'хонки'],
    models: [
      { name: 'EQ5', aliases: ['eq5'] },
      { name: 'H5', aliases: ['h5'] },
      { name: 'E-QM5', aliases: ['e-qm5', 'eqm5'] },
    ],
  },
  {
    brand: 'Lada',
    aliases: ['jiguli', 'жигули', 'жигул'],
    models: [
      { name: '2103', aliases: ['2103', 'jiguli 03', '03'] },
      { name: '2106', aliases: ['2106', 'jiguli 06', '06'] },
      { name: '2107', aliases: ['2107', 'jiguli 07', '07'] },
    ],
  },
  {
    brand: 'Ravon',
    aliases: ['ravon', 'равон'],
    models: [
      { name: 'R2', aliases: ['r2'] },
      { name: 'R3', aliases: ['r3', 'нексиа р3'] },
      { name: 'R4', aliases: ['r4'] },
      { name: 'Gentra', aliases: ['ravon gentra'] },
    ],
  },
  {
    brand: 'Dongfeng',
    aliases: ['dongfeng', 'донгфенг'],
    models: [
      { name: 'Forthing T5', aliases: ['forthing t5', 't5 evo'] },
    ],
  },
  {
    brand: 'DFSK',
    aliases: ['dfsk'],
    models: [
      { name: 'Glory 580', aliases: ['glory 580'] },
    ],
  },
  {
    brand: 'Lifan',
    aliases: ['lifan', 'лифан'],
    models: [
      { name: 'X70', aliases: ['lifan x70'] },
      { name: 'Myway', aliases: ['myway'] },
    ],
  },
];

// Build reverse index: model alias -> { brand, model }
const MODEL_BRAND_MAP = new Map<string, { brand: string; model: string }>();
for (const entry of BRAND_MODEL_DB) {
  for (const m of entry.models) {
    for (const alias of m.aliases) {
      MODEL_BRAND_MAP.set(alias.toLowerCase(), { brand: entry.brand, model: m.name });
    }
  }
}

function parseBrandModel(text: string): { brand: string | null; model: string | null } {
  // Bold/markdown/hashtag tozalash
  const lower = text.toLowerCase()
    .replace(/\*\*/g, '')
    .replace(/#+/g, ' ')
    .replace(/__/g, '')
    .replace(/\s+/g, ' ');

  // Find longest matching model alias (longer = more specific)
  let bestMatch: { brand: string; model: string } | null = null;
  let bestLen = 0;

  for (const [alias, info] of MODEL_BRAND_MAP.entries()) {
    const idx = lower.indexOf(alias);
    if (idx !== -1 && alias.length > bestLen) {
      const before = idx > 0 ? lower[idx - 1] : ' ';
      const after = idx + alias.length < lower.length ? lower[idx + alias.length] : ' ';
      const validBefore = /[\s\-:.,!?#()\n❗️🚘]/.test(before) || idx === 0;
      const validAfter = /[\s\-:.,!?#()\n❗️]/.test(after) || idx + alias.length === lower.length;
      if (validBefore && validAfter) {
        bestMatch = info;
        bestLen = alias.length;
      }
    }
  }

  if (bestMatch) return bestMatch;

  // Try brand-only match
  for (const entry of BRAND_MODEL_DB) {
    for (const alias of entry.aliases) {
      if (lower.includes(alias)) {
        return { brand: entry.brand, model: null };
      }
    }
  }

  return { brand: null, model: null };
}

function parseYear(text: string): number | null {
  const patterns = [
    /(?:yili|год|year)[\s:\-=]*(\d{4})/i,
    /(\d{4})[\s\-]*(?:yil|год)/i,
    /📅[^0-9]*(\d{4})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const y = parseInt(m[1]);
      if (y >= 1980 && y <= 2030) return y;
    }
  }
  const fallback = text.match(/\b(19[89]\d|20[0-2]\d)\b/);
  if (fallback) return parseInt(fallback[1]);
  return null;
}

function parsePrice(text: string): { amount: number | null; currency: 'USD' | 'UZS' | null } {
  // USD patterns
  const usdPatterns = [
    /(\d[\d\s,.]*)\s*(?:dollar|\$|usd|у\.?е\.?)/i,
    /(?:narx|нарх|price)[\s:\-]*(\d[\d\s,.]*)\s*\$/i,
    /💰[^0-9]*(\d[\d\s,.]*)\s*\$/,
  ];
  for (const p of usdPatterns) {
    const m = text.match(p);
    if (m) {
      const num = parseFloat(m[1].replace(/[\s,]/g, '').replace(/\.(?=\d{3})/g, ''));
      if (num > 0) return { amount: num, currency: 'USD' };
    }
  }

  // Dollar sign alone
  const dollarSign = text.match(/(\d[\d\s,.]*)\$/);
  if (dollarSign) {
    const num = parseFloat(dollarSign[1].replace(/[\s,]/g, '').replace(/\.(?=\d{3})/g, ''));
    if (num > 0) return { amount: num, currency: 'USD' };
  }

  // UZS / million patterns
  const uzsPatterns = [
    /(\d[\d\s,.]*)[\s]*(?:mln|млн|million|milyon|милион)/i,
    /(\d[\d\s,.]*)\s*(?:so'm|сўм|сум|sum|uzs)/i,
  ];
  for (const p of uzsPatterns) {
    const m = text.match(p);
    if (m) {
      const raw = m[1].replace(/[\s]/g, '').replace(/[,.]/g, '');
      const num = parseFloat(raw);
      if (num > 0) return { amount: num, currency: 'UZS' };
    }
  }

  const mlnMatch = text.toLowerCase().match(/(\d+)\s*mil/);
  if (mlnMatch) {
    return { amount: parseInt(mlnMatch[1]), currency: 'UZS' };
  }

  return { amount: null, currency: null };
}

function parseColor(text: string): string | null {
  const lower = text.toLowerCase();
  const colors: [string[], string][] = [
    [['oq', 'белый', 'white', 'ok', 'ок', 'оқ', 'мокрий', 'malochniy', 'молочный'], 'Oq'],
    [['qora', 'черный', 'black', 'кора', 'қора'], 'Qora'],
    [['kumush', 'серебр', 'silver'], 'Kumush'],
    [['qizil', 'красный', 'red'], 'Qizil'],
    [["ko'k", 'синий', 'blue', 'kok'], "Ko'k"],
    [['kulrang', 'серый', 'grey', 'gray', 'stalnoy', 'стальной'], 'Kulrang'],
    [['yashil', 'зеленый', 'green'], 'Yashil'],
    [['sariq', 'желтый', 'yellow'], 'Sariq'],
  ];

  const colorPattern = text.match(/(?:rang|ранг|цвет|color|🎨)[\s:\-]*([^\n,!]{2,20})/i);
  if (colorPattern) {
    const ct = colorPattern[1].toLowerCase().trim();
    for (const [keywords, name] of colors) {
      if (keywords.some(k => ct.includes(k))) return name;
    }
  }

  // Rang emoji yoki so'zi yaqinida rang topilsa
  for (const [keywords, name] of colors) {
    for (const k of keywords) {
      if (lower.includes(k)) return name;
    }
  }

  return null;
}

function parseMileage(text: string): string | null {
  const patterns = [
    /(?:probeg|prabeg|пробег|yurgan|юрган|📟|👣)[\s:\-]*(\d[\d\s,.]*)\s*(?:km|км|ming|тыс)/i,
    /(\d[\d\s,.]*)\s*(?:km|км)\s*(?:yurgan|пробег)/i,
    /(\d[\d\s,.]*)\s*(?:ming\s*km|тыс[.\s]*км)/i,
    /(?:probeg|prabeg|пробег|yurgan|юрган|📟|👣)[\s:\-]*(\d[\d\s,.]*)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      return m[1].replace(/\s/g, '').trim() + ' km';
    }
  }
  return null;
}

function parseFuelType(text: string): string | null {
  const lower = text.toLowerCase();
  if (/elektr|электр/.test(lower)) return 'Elektr';
  if (/gibrid|гибрид|hybrid/.test(lower)) return 'Gibrid';
  if (/dizel|дизел|diesel/.test(lower)) return 'Dizel';
  if (/metan|метан/.test(lower)) return 'Metan';
  if (/propan|пропан/.test(lower)) return 'Propan';
  if (/gaz|газ/.test(lower)) return 'Gaz';
  if (/benz|бенз|бензин/.test(lower)) return 'Benzin';
  return null;
}

function parseTransmission(text: string): string | null {
  const lower = text.toLowerCase();
  // Pozitsiya field: "Pozitsiya: Avtomat", "Позиция- автомат"
  const pozMatch = lower.match(/(?:pozitsi|позици)[\w]*[\s:\-]+([^\n,]{2,20})/i);
  if (pozMatch) {
    const poz = pozMatch[1].trim();
    if (/avtomat|автомат|at\b/.test(poz)) return 'Avtomat';
    if (/mexanik|механик|mt\b/.test(poz)) return 'Mexanika';
    if (/full|фулл/.test(poz)) return 'Avtomat';
    if (/premier|премьер/.test(poz)) return 'Avtomat';
  }
  if (/avtomat|автомат|афтамат|акпп/.test(lower)) return 'Avtomat';
  if (/tiptronik|типтроник/.test(lower)) return 'Tiptronik';
  if (/mexanik|механик|мкпп|xadavoy|ходовой|hadavoy/.test(lower)) return 'Mexanika';
  if (/robot|робот/.test(lower)) return 'Robot';
  return null;
}

function parseCondition(text: string): string | null {
  const lower = text.toLowerCase();
  const parts: string[] = [];

  if (/ideal|идеал/.test(lower)) parts.push('Ideal');
  if (/zavod|завод|оригинал/.test(lower)) parts.push('Zavodskoy');

  if (/kraska|краска/.test(lower)) {
    const m = lower.match(/(?:kraska|краска)[\s:\-]*([^\n]{3,40})/i);
    if (m) parts.push('Kraska: ' + m[1].trim());
    else parts.push('Kraskalangan');
  }
  if (/petno|пятно/.test(lower)) parts.push('Petno bor');
  if (/toza|тоза/.test(lower) && /kraska|краска/.test(lower)) parts.push('Kraska toza');

  return parts.length > 0 ? parts.join(', ') : null;
}

function parseCreditAvailable(text: string): boolean | null {
  const lower = text.toLowerCase();
  if (/kredit|кредит|nasiya|рассрочк|bo'lib to'l|bank\b/.test(lower)) return true;
  return null;
}

function parseCity(text: string): string | null {
  const lower = text.toLowerCase();
  const cities: [string[], string][] = [
    [['toshkent', 'ташкент', 'тошкент', 'tashkent'], 'Toshkent'],
    [['samarqand', 'самарканд', 'самаркант', 'samarkand'], 'Samarqand'],
    [['buxoro', 'бухар', 'бухоро'], 'Buxoro'],
    [['namangan', 'наманган'], 'Namangan'],
    [['andijon', 'андижан', 'андижон', 'andijan'], 'Andijon'],
    [["farg'ona", 'фергана', 'фаргона', 'фарғона', 'fargona', 'fergana'], "Farg'ona"],
    [["qo'qon", 'коканд', 'кўқон', 'қўқон', 'qoqon', 'кукон', 'quqon'], "Qo'qon"],
    [['qarshi', 'карши', 'қарши'], 'Qarshi'],
    [['navoiy', 'навои', 'навоий'], 'Navoiy'],
    [['jizzax', 'джизак', 'жиззах', 'жиззак', 'жизак', 'жиззох'], 'Jizzax'],
    [['termiz', 'термез', 'термиз'], 'Termiz'],
    [['nukus', 'нукус'], 'Nukus'],
    [['xorazm', 'хорезм', 'хоразм', 'urgench', 'урганч', 'xiva', 'хива'], 'Xorazm'],
    [['surxondaryo', 'сурхандар', 'сурхондарё', 'сурхондарьо', 'surxon'], 'Surxondaryo'],
    [['qashqadaryo', 'кашкадар', 'қашқадарё', 'kashkadarya'], 'Qashqadaryo'],
    [['sirdaryo', 'сырдар', 'сирдарё', 'guliston', 'гулистан', 'гулистон'], 'Sirdaryo'],
    [['urgut', 'ургут'], 'Urgut'],
    [['angren', 'ангрен'], 'Angren'],
    [['shahrisabz', 'шахрисабз', 'шахрисабс'], 'Shahrisabz'],
    [['asaka', 'асака'], 'Asaka'],
    [['margilan', 'маргилан', 'марғилон', "marg'ilon"], "Marg'ilon"],
    [['denov', 'денау', 'денов'], 'Denov'],
    [['kitob', 'китаб', 'китоб'], 'Kitob'],
    [['qoraqalpog', 'коракалпок', 'қорақалпоғ', 'karakalpak', 'нукус'], "Qoraqalpog'iston"],
    [['bog\'dod', 'богдод', 'боғдод'], "Bog'dod"],
    [['chirchiq', 'чирчик', 'чирчиқ'], 'Chirchiq'],
    [['olmaliq', 'алмалык', 'олмалиқ'], 'Olmaliq'],
    [['nurobod', 'нуробод'], 'Nurobod'],
    [['pop', 'поп'], 'Pop'],
    [['chust', 'чуст'], 'Chust'],
    [['kogon', 'когон', 'коғон'], 'Kogon'],
    [['zarafshon', 'зарафшан', 'зарафшон'], 'Zarafshon'],
    [['bekobod', 'бекабад', 'бекобод'], 'Bekobod'],
    [['yangiyul', 'янгиюл', 'янгиюль'], 'Yangiyul'],
  ];

  const manzilPattern = text.match(/(?:manzil|манзил|📍|🚩|🏠|shahar|город|шаҳар|viloyat)[\s:\-]*([^\n,!]{2,30})/i);
  if (manzilPattern) {
    const loc = manzilPattern[1].toLowerCase().trim();
    for (const [keywords, name] of cities) {
      if (keywords.some(k => loc.includes(k))) return name;
    }
  }

  for (const [keywords, name] of cities) {
    if (keywords.some(k => lower.includes(k))) return name;
  }

  return null;
}

export function parseCarAd(text: string): ParsedCarData {
  const normalized = normalizeText(text);
  const { brand, model } = parseBrandModel(normalized);
  const { amount: priceAmount, currency: priceCurrency } = parsePrice(normalized);

  return {
    brand,
    model,
    year: parseYear(normalized),
    priceAmount,
    priceCurrency,
    color: parseColor(normalized),
    mileage: parseMileage(normalized),
    fuelType: parseFuelType(normalized),
    transmission: parseTransmission(normalized),
    condition: parseCondition(normalized),
    creditAvailable: parseCreditAvailable(normalized),
    city: parseCity(normalized),
  };
}
