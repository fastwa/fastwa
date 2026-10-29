import {
  downloadContentFromMessage,
  normalizeMessageContent,
  toBuffer,
  type WAMessage,
  type WASocket,
  type proto
} from '@whiskeysockets/baileys';

import {
  Command,
  Content,
  Controller,
  Message,
  On,
  Quoted,
  RemoteJid,
  Socket,
  UseGuards
} from '@fastwa/common';

import qrcode from 'qrcode-terminal';

import { AiService } from './ai.service.js';
import { DMGuard } from './dm.guard.js';
import { TextOnlyGuard } from './text-only.guard.js';

// Matches every message; the guards decide which ones are answered
const ANY_MESSAGE = /^[\s\S]*$/;

@Controller()
export class AiController {
  @Socket()
  socket: WASocket;

  constructor(private readonly aiService: AiService) {}

  @On('connection.update')
  onConnectionUpdate({ qr }: { qr?: string }) {
    if (qr) {
      qrcode.generate(qr, { small: true });
    }
  }

  @Command(ANY_MESSAGE)
  @UseGuards(DMGuard, TextOnlyGuard)
  async reply(
    @Content() prompt: string,
    @RemoteJid() remoteJid: string,
    @Quoted() quoted: proto.IMessage | undefined,
    @Message() message: WAMessage
  ) {
    const content = normalizeMessageContent(message.message);
    const imageMessage = content?.imageMessage ?? quoted?.imageMessage;

    await this.socket.sendPresenceUpdate('composing', remoteJid);

    try {
      return await this.aiService.ask({
        prompt,
        image: imageMessage && (await this.downloadImage(imageMessage)),
        socket: this.socket,
        message
      });
    } catch (error) {
      return 'Sorry, I could not answer that right now. Please try again.';
    } finally {
      await this.socket.sendPresenceUpdate('paused', remoteJid);
    }
  }

  private async downloadImage(imageMessage: proto.Message.IImageMessage) {
    const stream = await downloadContentFromMessage(imageMessage, 'image');

    return {
      data: await toBuffer(stream),
      mediaType: imageMessage.mimetype ?? 'image/jpeg'
    };
  }
}
