import { Type } from './type.interface';

export interface InstanceOptions {
  name: string;
  metatype: Type<object>;
  instance: Type<object> | null;
}
