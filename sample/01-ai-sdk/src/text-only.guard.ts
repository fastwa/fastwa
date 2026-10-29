import { normalizeMessageContent } from '@whiskeysockets/baileys';

import { CanActivate, ExecutionContext, Injectable } from 'fastwa';

// Only lets through messages that carry text: plain text, replies and media
// captions. Reactions, stickers, audio and media without a caption are ignored.
@Injectable()
export class TextOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const content = normalizeMessageContent(
      context.switchToAdapter().getMessage().message
    );

    return !!(
      content?.conversation ||
      content?.extendedTextMessage?.text ||
      content?.imageMessage?.caption ||
      content?.videoMessage?.caption ||
      content?.documentMessage?.caption
    );
  }
}
