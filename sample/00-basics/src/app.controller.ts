import type { WASocket } from '@whiskeysockets/baileys';

import { Command, Controller, Message, On, Socket } from '@fastwa/common';

import qrcode from 'qrcode-terminal';

import { GreetingService } from './greeting.service.js';

@Controller()
export class AppController {
  @Socket()
  socket: WASocket;

  constructor(private readonly greetingService: GreetingService) {}

  @On('connection.update')
  onConnectionUpdate({ qr }: { qr?: string }) {
    if (qr) {
      qrcode.generate(qr, { small: true });
    }
  }

  @Command('!hello')
  hello(@Message('pushName') name: string | undefined) {
    return this.greetingService.greet(name ?? 'there');
  }
}
