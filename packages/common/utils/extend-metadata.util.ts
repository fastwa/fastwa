export function extendArrayMetadata<T extends unknown[]>(
  key: string,
  metadata: T,
  target: Function
) {
  const previousValue = Reflect.getMetadata(key, target) || [];
  const value = [...previousValue, ...metadata];

  Reflect.defineMetadata(key, value, target);
}
