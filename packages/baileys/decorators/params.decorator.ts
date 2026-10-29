import { WAMessage, proto } from '@whiskeysockets/baileys';

import { FastwaMessage, createParamDecorator } from 'fastwa';

import { ReactionMessage } from '../interfaces';

type BaileysMessage = FastwaMessage<WAMessage | ReactionMessage>;

/**
 * Extracts the message as received from Baileys (`WAMessage`, or the
 * `messages.reaction` entry in `@Reaction()` handlers), or one of its
 * properties.
 *
 * For example:
 * ```typescript
 * hello(@Message('pushName') name: string)
 * ```
 *
 * @publicApi
 */
export const Message = createParamDecorator(
  (property: keyof WAMessage | undefined, message: BaileysMessage) =>
    property ? message.raw[property] : message.raw
);

/**
 * Extracts the text, media caption or reaction emoji of the message.
 *
 * @publicApi
 */
export const Content = createParamDecorator(
  (_, message: BaileysMessage) => message.text
);

/**
 * Extracts the message the received one replies to (`proto.IMessage`),
 * unwrapped from ephemeral and view-once containers.
 *
 * @publicApi
 */
export const Quoted = createParamDecorator(
  (_, message: BaileysMessage): proto.IMessage | undefined =>
    message.quoted?.raw as proto.IMessage
);

/**
 * Extracts the JID of the chat as received (`key.remoteJid`).
 *
 * @publicApi
 */
export const RemoteJid = createParamDecorator(
  (_, message: BaileysMessage) => message.raw.key.remoteJid
);

/**
 * Extracts the alternate JID of the chat (`key.remoteJidAlt`).
 * When `@RemoteJid()` is a LID, this is the phone number JID, and vice versa.
 *
 * @publicApi
 */
export const RemoteJidAlt = createParamDecorator(
  (_, message: BaileysMessage) => message.raw.key.remoteJidAlt
);
