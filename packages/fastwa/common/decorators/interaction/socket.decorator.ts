import { SOCKET_METADATA } from '../..';

export const Socket = (): PropertyDecorator => {
  return (target, propertyKey) => {
    Reflect.set(target, propertyKey, null);
    Reflect.defineMetadata(SOCKET_METADATA, true, target, propertyKey);
  };
};
