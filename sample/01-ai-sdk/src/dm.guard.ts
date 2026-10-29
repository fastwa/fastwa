import { isLidUser, isPnUser } from '@whiskeysockets/baileys';

import { CanActivate, ExecutionContext, Injectable } from 'fastwa';

// Only lets through messages received in private chats. Groups, broadcasts
// and channels are ignored, and so are the bot's own messages, which
// WhatsApp also delivers and would otherwise make it answer itself.
@Injectable()
export class DMGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const { remoteJid, fromMe } = context.switchToAdapter().getMessage().key;
    return !fromMe && !!(isPnUser(remoteJid) || isLidUser(remoteJid));
  }
}
