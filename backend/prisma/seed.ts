import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Administrator',
      role: UserRole.ADMIN,
    },
  });

  await prisma.smsTemplate.upsert({
    where: { id: 'default-template' },
    update: {},
    create: {
      id: 'default-template',
      name: 'Default Promo',
      content:
        "Assalomu alaykum! Mashinangizni sotmoqchimisiz? Biz eng yaxshi narxni taklif qilamiz! Katalogimizni ko'ring: {miniapp_link}",
      isDefault: true,
    },
  });

  const defaultSettings = [
    { key: 'sms_enabled', value: 'true' },
    { key: 'sms_rate_limit_hours', value: '24' },
    { key: 'reminder_default_hours', value: '24' },
    { key: 'auto_assign_leads', value: 'false' },
  ];

  for (const setting of defaultSettings) {
    await prisma.appSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
