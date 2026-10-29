import { FastwaFactory } from 'fastwa';
import { BaileysAdapter } from '@fastwa/baileys';

import {
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import { AIModule } from './ai.module';

async function bootstrap() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  const app = await FastwaFactory.create(AIModule, new BaileysAdapter({
    auth: state,
    saveCreds,
    version,
    browser: Browsers.macOS('Fastwa AI SDK')
  }));

  await app.listen();
}

bootstrap();
