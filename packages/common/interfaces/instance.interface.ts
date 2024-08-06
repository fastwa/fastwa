import { Type } from './type.interface';
import { SettlementSignal } from '@fastwa/core/injector/settlement-signal';

export interface InstanceOptions {
  name: string;
  metatype: Type<object>;
  instance: Type<object> | null;
  settlementSignal: SettlementSignal;
}
