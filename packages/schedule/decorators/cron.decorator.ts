import 'reflect-metadata';
import { CRON_OPTIONS } from '../constants';

export function Cron(time: string): MethodDecorator {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(CRON_OPTIONS, time, descriptor.value);
  };
}
