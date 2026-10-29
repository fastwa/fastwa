import {
  downloadContentFromMessage,
  normalizeMessageContent,
  toBuffer,
  type WAMessage,
  type WASocket,
  type proto
} from '@whiskeysockets/baileys';

import { Command, Controller, On, UseGuards } from 'fastwa';

import {
  Content,
  Message,
  Quoted,
  RemoteJid,
  Socket
} from '@fastwa/baileys';

import qrcode from 'qrcode-terminal';

import { DMGuard } from './dm.guard';
import { AiService } from './ai.service';
import { ContentGuard } from './content.guard';

// Matches every message; the guards decide which ones are answered
const ANY_MESSAGE = /^[\s\S]*$/;

@Controller()
export class AiController {
  @Socket()
  socket: WASocket;

  constructor(private readonly ai: AiService) { }

  @On('connection.update')
  onConnectionUpdate({ qr }: { qr?: string }) {
    if (qr) {
      qrcode.generate(qr, { small: true });
    }
  }

  @Command(ANY_MESSAGE)
  @UseGuards(DMGuard, ContentGuard)
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
      return await this.ai.ask({
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
