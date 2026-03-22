/**
 * Guruh nomidan shaharni aniqlash
 * O'zbekiston shaharlari ro'yxati
 */

const CITY_KEYWORDS: Record<string, string[]> = {
  'Toshkent': ['toshkent', 'tashkent', 'ташкент', 'тошкент', 'tosh', 'таш'],
  'Samarqand': ['samarqand', 'samarkand', 'самарканд', 'самаркант'],
  'Buxoro': ['buxoro', 'bukhara', 'бухара', 'бухоро'],
  'Andijon': ['andijon', 'andijan', 'андижон', 'андижан'],
  'Farg\'ona': ['fargona', 'fergana', 'фергана', 'фаргона'],
  'Namangan': ['namangan', 'наманган'],
  'Qashqadaryo': ['qashqadaryo', 'kashkadarya', 'кашкадарья', 'қашқадарё', 'qarshi', 'карши'],
  'Surxondaryo': ['surxondaryo', 'surkhandarya', 'сурхандарья', 'termiz', 'termez', 'термез'],
  'Xorazm': ['xorazm', 'khorezm', 'хорезм', 'urganch', 'urgench', 'ургенч'],
  'Navoiy': ['navoiy', 'navoi', 'навоий', 'навои'],
  'Jizzax': ['jizzax', 'jizzakh', 'жиззах', 'джизак'],
  'Sirdaryo': ['sirdaryo', 'syrdarya', 'сирдарья', 'guliston', 'гулистан', 'гулистон'],
  'Nukus': ['nukus', 'нукус', 'qoraqalpoq', 'karakalpak', 'каракалпак'],
  'Chirchiq': ['chirchiq', 'chirchik', 'чирчик', 'чирчиқ'],
  'Olmaliq': ['olmaliq', 'almalyk', 'алмалык', 'олмалиқ'],
  'Angren': ['angren', 'ангрен'],
  'Bekobod': ['bekobod', 'bekabad', 'бекабад', 'бекобод'],
  'Kokand': ['kokand', 'qoqon', 'коканд', 'қўқон'],
  'Margilan': ['margilan', 'margilon', 'маргилан', 'маргилон'],
  'Shahrisabz': ['shahrisabz', 'shaxrisabz', 'шахрисабз'],
  'Denov': ['denov', 'denau', 'денау', 'денов'],
  'Zarafshon': ['zarafshon', 'zarafshan', 'зарафшан'],
};

export function detectCity(groupName: string): string | null {
  if (!groupName) return null;

  const lower = groupName.toLowerCase();

  for (const [city, keywords] of Object.entries(CITY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return city;
      }
    }
  }

  return null;
}
