import { Type } from "./type.interface";
import { InteractionType } from "../enums";

export interface ICommand {
  method: string;
  command: string;
  type: InteractionType;
  instance: Type<object>;
  callback: (...args: any[]) => unknown;
}
