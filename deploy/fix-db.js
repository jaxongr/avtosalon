const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Barcha guruhlarning kalit so'zlarini tozalash
  const r = await p.monitoredGroup.updateMany({ data: { keywords: [] } });
  console.log('Keywords cleared:', r.count);

  // Session borligini tekshirish
  const s = await p.appSettings.findUnique({ where: { key: 'telegram_session_string' } });
  console.log('Session:', s ? 'EXISTS' : 'NOT FOUND');

  // Guruhlar soni
  const g = await p.monitoredGroup.count();
  console.log('Groups:', g);
}

main().catch(console.error).finally(() => p.$disconnect());
