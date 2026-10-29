import {
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import { FastwaFactory } from 'fastwa';
import { BaileysAdapter } from '@fastwa/baileys';

import { AppModule } from './app.module';

async function bootstrap() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const adapter = new BaileysAdapter({
    auth: state,
    saveCreds,
    version,
    browser: Browsers.macOS('Fastwa')
  });

  const app = await FastwaFactory.create(AppModule, adapter);

  await app.listen();
}

bootstrap();
