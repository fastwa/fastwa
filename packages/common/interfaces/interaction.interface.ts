import { Type } from './type.interface';
import { InteractionType } from '../enums';
import { BaileysEvent, proto } from '@whiskeysockets/baileys';

export interface ReactionMessage {
  key: proto.IMessageKey;
  reaction: proto.IReaction;
}

export interface Interaction {
  method: string;
  command: string | BaileysEvent;
  moduleName?: string;
  type: InteractionType;
  instance: Type<object>;
  callback: (...args: any[]) => unknown;
}
