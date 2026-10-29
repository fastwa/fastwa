import {
  isConstructor,
  isFunction,
  Type,
  ADAPTER_PROPERTY_METADATA
} from '../../common';

export class MetadataScanner {
  public scanMethods<R = any>(
    prototype: object,
    callback: (method: string) => R
  ) {
    return Object.getOwnPropertyNames(prototype)
      .filter((item) => !isConstructor(item) && isFunction(prototype[item]))
      .map(callback);
  }

  public *scanAdapterProperties(
    instance: Type<object>
  ): Generator<[string, (adapter: unknown) => unknown]> {
    for (const property in instance) {
      const key = String(property);
      const resolve = Reflect.getMetadata(
        ADAPTER_PROPERTY_METADATA,
        instance,
        key
      );

      if (resolve) yield [key, resolve];
    }
  }
}
