import { Command, Controller, On } from 'fastwa';
import { Message } from '@fastwa/baileys';

import qrcode from 'qrcode-terminal';

import { AppService } from './app.service';

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
