import 'reflect-metadata';

import {
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import { FastwaFactory } from 'fastwa';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const { version } = await fetchLatestBaileysVersion();

  const app = await FastwaFactory.create(AppModule, {
    auth: state,
    saveCreds,
    version,
    browser: Browsers.macOS('Fastwa AI SDK')
  });

  await app.listen();
}

bootstrap();
