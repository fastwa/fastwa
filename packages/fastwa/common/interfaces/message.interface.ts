/**
 * A message received from a platform, in the shape handlers, guards and
 * collectors see it, whatever the platform
 */
export interface FastwaMessage<TRaw = unknown> {
  /**
   * Message ID on the platform
   */
  id: string;

  /**
   * Chat the message belongs to: the user in private chats, the group otherwise
   */
  chatId: string;

  /**
   * The same chat in another address format, when the platform has one
   * (e.g. LID and phone number on WhatsApp)
   */
  chatIdAlt?: string;

  /**
   * Author of the message; the same as `chatId` in private chats
   */
  senderId: string;

  /**
   * Display name of the author, when the platform provides it
   */
  senderName?: string;

  fromMe: boolean;
  isGroup: boolean;

  /**
   * Text, media caption or reaction emoji
   */
  text?: string;

  /**
   * Message this one replies to
   */
  quoted?: FastwaQuotedMessage;

  /**
   * Set when the message is a reaction
   */
  reaction?: FastwaReaction;

  /**
   * Unix time in milliseconds
   */
  timestamp: number;

  /**
   * Platform that received the message, e.g. `baileys`
   */
  platform: string;

  /**
   * The message as received from the platform
   */
  raw: TRaw;
}

export interface FastwaQuotedMessage<TRaw = unknown> {
  id?: string;
  senderId?: string;
  text?: string;
  raw: TRaw;
}

export interface FastwaReaction {
  emoji: string;

  /**
   * ID of the message reacted to
   */
  targetId: string;
}
