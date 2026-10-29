import { WAMessageKey, proto } from '@whiskeysockets/baileys';

/**
 * An entry of the `messages.reaction` event
 */
export interface ReactionMessage {
  /**
   * The message reacted to
   */
  key: WAMessageKey;
  reaction: proto.IReaction;
}
