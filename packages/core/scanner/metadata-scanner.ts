import {
  isConstructor,
  isFunction,
  Type,
  SOCKET_METADATA
} from '@fastwa/common';

export class MetadataScanner {
  public scanMethods<R = any>(
    prototype: object,
    callback: (method: string) => R
  ) {
    return Object.getOwnPropertyNames(prototype)
      .filter((item) => !isConstructor(item) && isFunction(prototype[item]))
      .map(callback);
  }

  public *scanServerHooks(instance: Type<object>) {
    for (const property in instance) {
      const key = String(property);
      const isSocket = Reflect.getMetadata(SOCKET_METADATA, instance, key);

      if (isSocket) yield key;
    }
  }
}
