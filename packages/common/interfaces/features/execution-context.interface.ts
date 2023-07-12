import { Type } from '../type.interface';
import { Arguments } from './arguments-adapter.interface';

export interface ExecutionContext extends Arguments {
  getClass<T = any>(): Type<T>;
  getHandler(): Function;
}
