/**
 * Telegram Session String Generator
 *
 * Bu script gramjs uchun session string yaratadi.
 * Ishga tushirish: npx ts-node scripts/generate-session.ts
 *
 * Sizdan telefon raqam va SMS kod so'raladi.
 * Natijada session string konsolga chiqadi - uni .env fayliga TELEGRAM_SESSION_STRING ga qo'ying.
 */

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as readline from 'readline';

const API_ID = 37640919;
const API_HASH = '8bab0de95e9830858e6040621dd1b4a7';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('=== Telegram Session String Generator ===\n');

  const session = new StringSession('');
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await ask('Telefon raqamingiz (+998...): '),
    password: async () => await ask('2FA parolingiz (bo\'lmasa Enter): '),
    phoneCode: async () => await ask('Telegram\'dan kelgan kod: '),
    onError: (err) => console.error('Xato:', err.message),
  });

  const sessionString = client.session.save() as unknown as string;

  console.log('\n=== SESSION STRING (bu qatorni .env ga qo\'ying) ===');
  console.log(sessionString);
  console.log('===================================================\n');

  console.log('TELEGRAM_SESSION_STRING=' + sessionString);
  console.log('\nBu stringni serverda .env faylga qo\'shing.');

  await client.disconnect();
  rl.close();
  process.exit(0);
}

main().catch(console.error);
