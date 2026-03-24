import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as readline from 'readline';

const API_ID = 37640919;
const API_HASH = '8bab0de95e9830858e6040621dd1b4a7';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q: string): Promise<string> => new Promise(r => rl.question(q, r));

async function main() {
  const session = new StringSession('');
  const client = new TelegramClient(session, API_ID, API_HASH, { connectionRetries: 5 });

  await client.start({
    phoneNumber: async () => await ask('Telefon raqam (+998...): '),
    password: async () => await ask('2FA parol: '),
    phoneCode: async () => await ask('Kod: '),
    onError: (err) => console.log('Error:', err),
  });

  console.log('\nSESSION:', client.session.save());
  rl.close();
  await client.disconnect();
}
main();
