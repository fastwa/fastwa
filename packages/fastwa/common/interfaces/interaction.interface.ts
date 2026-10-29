import { Type } from './type.interface';
import { InteractionType } from '../enums';

export interface Interaction {
  method: string;
  command: string | RegExp;
  moduleName?: string;
  type: InteractionType;
  instance: Type<object>;
  callback: (...args: any[]) => unknown;
}
