import { FastwaFactory } from 'fastwa';
import { BaileysAdapter } from '@fastwa/baileys';

import {
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import { GreetingModule } from './greeting.module';

async function bootstrap() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const app = await FastwaFactory.create(GreetingModule, new BaileysAdapter({
    auth: state,
    saveCreds,
    version,
    browser: Browsers.macOS('Fastwa Basics')
  }));

  await app.listen();
}

bootstrap();
