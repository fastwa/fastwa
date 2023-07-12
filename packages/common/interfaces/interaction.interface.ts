import { Type } from './type.interface';
import { InteractionType } from '../enums';
import { BaileysEvent } from '@whiskeysockets/baileys';

export interface Interaction {
  method: string;
  command: string | BaileysEvent;
  moduleName?: string;
  type: InteractionType;
  instance: Type<object>;
  callback: (...args: any[]) => unknown;
}
