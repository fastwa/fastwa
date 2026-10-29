import {
  WAMessage,
  getContentType,
  isJidGroup,
  jidNormalizedUser,
  normalizeMessageContent,
  proto,
  toNumber
} from '@whiskeysockets/baileys';

import { FastwaMessage, FastwaQuotedMessage, ReactionMessage } from 'fastwa';

export const BAILEYS_PLATFORM = 'baileys';

export function getMessageText(message: proto.IMessage | null | undefined) {
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    message?.reactionMessage?.text ||
    undefined
  );
}

function getQuotedMessage(
  content: proto.IMessage | undefined
): FastwaQuotedMessage<proto.IMessage> | undefined {
  const { contextInfo } = (content?.[getContentType(content)] ?? {}) as {
    contextInfo?: proto.IContextInfo;
  };

  if (!contextInfo?.quotedMessage) {
    return;
  }

  const quoted = normalizeMessageContent(contextInfo.quotedMessage);

  return {
    id: contextInfo.stanzaId ?? undefined,
    senderId: contextInfo.participant
      ? jidNormalizedUser(contextInfo.participant)
      : undefined,
    text: getMessageText(quoted),
    raw: quoted
  };
}

function getSenderId(key: proto.IMessageKey, meId?: string) {
  const sender = key.participant || (key.fromMe ? meId : key.remoteJid);
  return sender ? jidNormalizedUser(sender) : undefined;
}

/**
 * Converts a Baileys message into the platform-independent message model
 *
 * @param meId JID of the connected account, the author of `fromMe` messages
 */
export function toFastwaMessage(
  message: WAMessage,
  meId?: string
): FastwaMessage<WAMessage> {
  const { key } = message;

  // Unwraps ephemeral, view-once, edited and document-with-caption messages
  const content = normalizeMessageContent(message.message);

  return {
    id: key.id,
    chatId: jidNormalizedUser(key.remoteJid),
    chatIdAlt: key.remoteJidAlt
      ? jidNormalizedUser(key.remoteJidAlt)
      : undefined,
    senderId: getSenderId(key, meId),
    senderName: message.pushName ?? undefined,
    fromMe: !!key.fromMe,
    isGroup: !!isJidGroup(key.remoteJid),
    text: getMessageText(content),
    quoted: getQuotedMessage(content),
    reaction: content?.reactionMessage
      ? {
          emoji: content.reactionMessage.text || '',
          targetId: content.reactionMessage.key?.id
        }
      : undefined,
    timestamp: toNumber(message.messageTimestamp) * 1000,
    platform: BAILEYS_PLATFORM,
    raw: message
  };
}

/**
 * Converts a `messages.reaction` entry: `key` is the message reacted to and
 * `reaction.key` the reaction itself
 */
export function toFastwaReaction(
  { key, reaction }: ReactionMessage,
  meId?: string
): FastwaMessage<ReactionMessage> {
  const reactionKey = reaction.key ?? key;

  return {
    id: reactionKey.id,
    chatId: jidNormalizedUser(key.remoteJid),
    chatIdAlt: key.remoteJidAlt
      ? jidNormalizedUser(key.remoteJidAlt)
      : undefined,
    senderId: getSenderId(reactionKey, meId),
    fromMe: !!reactionKey.fromMe,
    isGroup: !!isJidGroup(key.remoteJid),
    text: reaction.text || undefined,
    reaction: {
      emoji: reaction.text || '',
      targetId: key.id
    },
    timestamp: toNumber(reaction.senderTimestampMs) || Date.now(),
    platform: BAILEYS_PLATFORM,
    raw: { key, reaction }
  };
}
