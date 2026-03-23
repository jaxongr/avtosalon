import { ParsedCarData } from '../interfaces/parsed-car-data.interface';

function normalizeText(text: string): string {
  return text
    .replace(/[\u02BB\u02BC\u2018\u2019\u0060\u00B4]/g, "'")
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
    aliases: ['chevrolet', 'shevrolet', 'shevralet'],
    models: [
      { name: 'Cobalt', aliases: ['cobalt', 'kobalt'] },
      { name: 'Malibu', aliases: ['malibu', 'maliby', 'malib'] },
      { name: 'Malibu 2', aliases: ['malibu 2', 'malibu2'] },
      { name: 'Gentra', aliases: ['gentra'] },
      { name: 'Lacetti', aliases: ['lacetti', 'lasetti', 'lachetti'] },
      { name: 'Nexia', aliases: ['nexia', 'nexia 3', 'nexia3'] },
      { name: 'Damas', aliases: ['damas'] },
      { name: 'Labo', aliases: ['labo'] },
      { name: 'Spark', aliases: ['spark'] },
      { name: 'Captiva', aliases: ['captiva'] },
      { name: 'Tracker', aliases: ['tracker', 'treker'] },
      { name: 'Tracker 2', aliases: ['tracker 2', 'treker 2'] },
      { name: 'Equinox', aliases: ['equinox'] },
      { name: 'Onix', aliases: ['onix'] },
      { name: 'Monza', aliases: ['monza'] },
      { name: 'Orlando', aliases: ['orlando'] },
      { name: 'Traverse', aliases: ['traverse'] },
      { name: 'Tahoe', aliases: ['tahoe'] },
      { name: 'Epica', aliases: ['epica'] },
      { name: 'Cruze', aliases: ['cruze'] },
      { name: 'Aveo', aliases: ['aveo'] },
      { name: 'Matiz', aliases: ['matiz'] },
      { name: 'Tico', aliases: ['tico', 'tiko'] },
    ],
  },
  {
    brand: 'Toyota',
    aliases: ['toyota', 'tayota'],
    models: [
      { name: 'Camry', aliases: ['camry', 'kamri', 'kambri'] },
      { name: 'Corolla', aliases: ['corolla'] },
      { name: 'Land Cruiser', aliases: ['land cruiser', 'cruiser'] },
      { name: 'Prado', aliases: ['prado'] },
      { name: 'RAV4', aliases: ['rav4', 'rav 4'] },
      { name: 'Hilux', aliases: ['hilux'] },
      { name: 'Avalon', aliases: ['avalon'] },
      { name: 'Yaris', aliases: ['yaris'] },
      { name: 'Crown', aliases: ['crown'] },
      { name: 'Fortuner', aliases: ['fortuner'] },
      { name: 'Highlander', aliases: ['highlander'] },
    ],
  },
  {
    brand: 'Hyundai',
    aliases: ['hyundai', 'hundai', 'xundai'],
    models: [
      { name: 'Sonata', aliases: ['sonata'] },
      { name: 'Tucson', aliases: ['tucson', 'tukson'] },
      { name: 'Elantra', aliases: ['elantra'] },
      { name: 'Accent', aliases: ['accent', 'aksent'] },
      { name: 'Santa Fe', aliases: ['santa fe', 'santafe'] },
      { name: 'Creta', aliases: ['creta'] },
      { name: 'Palisade', aliases: ['palisade'] },
      { name: 'Porter', aliases: ['porter'] },
      { name: 'Venue', aliases: ['venue'] },
    ],
  },
  {
    brand: 'Kia',
    aliases: ['kia'],
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
    aliases: ['byd'],
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
    aliases: ['geely'],
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
    aliases: ['chery', 'cheri'],
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
    aliases: ['haval'],
    models: [
      { name: 'Jolion', aliases: ['jolion'] },
      { name: 'Dargo', aliases: ['dargo'] },
      { name: 'H6', aliases: ['h6'] },
      { name: 'F7', aliases: ['f7'] },
    ],
  },
  {
    brand: 'Lada',
    aliases: ['lada', 'vaz'],
    models: [
      { name: 'Vesta', aliases: ['vesta'] },
      { name: 'Granta', aliases: ['granta'] },
      { name: 'Niva', aliases: ['niva'] },
      { name: 'Priora', aliases: ['priora'] },
    ],
  },
  {
    brand: 'Mercedes-Benz',
    aliases: ['mercedes', 'mersedes', 'benz'],
    models: [
      { name: 'S-Class', aliases: ['s class', 's-class', 's500', 's550'] },
      { name: 'E-Class', aliases: ['e class', 'e-class', 'e200', 'e220', 'e300'] },
      { name: 'C-Class', aliases: ['c class', 'c-class', 'c200', 'c180'] },
      { name: 'Sprinter', aliases: ['sprinter'] },
    ],
  },
  {
    brand: 'BMW',
    aliases: ['bmw'],
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
    aliases: ['volkswagen', 'vw'],
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
    aliases: ['nissan'],
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
    aliases: ['moskvich', 'moskivich'],
    models: [
      { name: '412', aliases: ['412pikap', '412'] },
    ],
  },
  {
    brand: 'GAZ',
    aliases: ['gaz'],
    models: [
      { name: 'Gazelle', aliases: ['gazelle', 'gazel'] },
    ],
  },
  {
    brand: 'Jetour',
    aliases: ['jetour'],
    models: [
      { name: 'Dashing', aliases: ['dashing'] },
      { name: 'X70', aliases: ['x70'] },
    ],
  },
  {
    brand: 'Exeed',
    aliases: ['exeed'],
    models: [
      { name: 'VX', aliases: ['vx'] },
      { name: 'LX', aliases: ['lx'] },
      { name: 'TXL', aliases: ['txl'] },
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
  const lower = text.toLowerCase();

  // Find longest matching model alias (longer = more specific)
  let bestMatch: { brand: string; model: string } | null = null;
  let bestLen = 0;

  for (const [alias, info] of MODEL_BRAND_MAP.entries()) {
    const idx = lower.indexOf(alias);
    if (idx !== -1 && alias.length > bestLen) {
      const before = idx > 0 ? lower[idx - 1] : ' ';
      const after = idx + alias.length < lower.length ? lower[idx + alias.length] : ' ';
      if (/[\s\-:.,!?#()\n]/.test(before) || idx === 0) {
        if (/[\s\-:.,!?#()\n]/.test(after) || idx + alias.length === lower.length) {
          bestMatch = info;
          bestLen = alias.length;
        }
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
    /(\d[\d\s,.]*)\s*(?:mln|млн|million|milyon|милион)/i,
    /(\d[\d\s,.]*)\s*(?:so'm|сум|sum|uzs)/i,
  ];
  for (const p of uzsPatterns) {
    const m = text.match(p);
    if (m) {
      const num = parseFloat(m[1].replace(/[\s,]/g, ''));
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
    [['oq', 'белый', 'white', 'ok'], 'Oq'],
    [['qora', 'черный', 'black'], 'Qora'],
    [['kumush', 'серебр', 'silver'], 'Kumush'],
    [['qizil', 'красный', 'red'], 'Qizil'],
    [["ko'k", 'синий', 'blue', 'kok'], "Ko'k"],
    [['kulrang', 'серый', 'grey', 'gray'], 'Kulrang'],
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

  for (const [keywords, name] of colors) {
    for (const k of keywords) {
      const idx = lower.indexOf(k);
      if (idx !== -1) {
        const around = lower.substring(Math.max(0, idx - 15), idx + k.length + 15);
        if (/rang|цвет|🎨/.test(around)) return name;
      }
    }
  }

  return null;
}

function parseMileage(text: string): string | null {
  const patterns = [
    /(?:probeg|пробег|yurgan|юрган|📟)[\s:\-]*(\d[\d\s,.]*)\s*(?:km|км|ming|тыс)/i,
    /(\d[\d\s,.]*)\s*(?:km|км)\s*(?:yurgan|пробег)/i,
    /(\d[\d\s,.]*)\s*(?:ming\s*km|тыс[.\s]*км)/i,
    /(?:probeg|пробег|yurgan|юрган|📟)[\s:\-]*(\d[\d\s,.]*)/i,
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
  if (/benz|бенз/.test(lower)) return 'Benzin';
  return null;
}

function parseTransmission(text: string): string | null {
  const lower = text.toLowerCase();
  if (/avtomat|автомат|акпп/.test(lower)) return 'Avtomat';
  if (/tiptronik|типтроник/.test(lower)) return 'Tiptronik';
  if (/mexanik|механик|мкпп|xadavoy|ходовой/.test(lower)) return 'Mexanika';
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
    [['toshkent', 'ташкент', 'tashkent'], 'Toshkent'],
    [['samarqand', 'самарканд'], 'Samarqand'],
    [['buxoro', 'бухар'], 'Buxoro'],
    [['namangan', 'наманган'], 'Namangan'],
    [['andijon', 'андижан'], 'Andijon'],
    [["farg'ona", 'фергана', 'fargona'], "Farg'ona"],
    [["qo'qon", 'коканд', 'qoqon'], "Qo'qon"],
    [['qarshi', 'карши'], 'Qarshi'],
    [['navoiy', 'навои'], 'Navoiy'],
    [['jizzax', 'джизак'], 'Jizzax'],
    [['termiz', 'термез'], 'Termiz'],
    [['nukus', 'нукус'], 'Nukus'],
    [['xorazm', 'хорезм', 'urgench', 'урганч'], 'Xorazm'],
    [['surxondaryo', 'сурхандар'], 'Surxondaryo'],
    [['qashqadaryo', 'кашкадар'], 'Qashqadaryo'],
    [['sirdaryo', 'сырдар'], 'Sirdaryo'],
    [['urgut', 'ургут'], 'Urgut'],
    [['angren', 'ангрен'], 'Angren'],
    [['shahrisabz', 'шахрисабз'], 'Shahrisabz'],
    [['asaka', 'асака'], 'Asaka'],
    [['margilan', 'маргилан'], "Marg'ilon"],
    [['denov', 'денау'], 'Denov'],
    [['kitob', 'китаб'], 'Kitob'],
  ];

  const manzilPattern = text.match(/(?:manzil|манзил|📍|shahar|город|viloyat)[\s:\-]*([^\n,!]{2,30})/i);
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
