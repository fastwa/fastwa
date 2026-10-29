import { Command, Controller, Message, On } from '@fastwa/common';

import qrcode from 'qrcode-terminal';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @On('connection.update')
  onConnectionUpdate({ qr }: { qr?: string }) {
    if (qr) {
      qrcode.generate(qr, { small: true });
    }
  }

  @Command('!hello')
  hello(@Message('pushName') name: string | undefined) {
    return this.appService.greet(name ?? 'there');
  }
}
