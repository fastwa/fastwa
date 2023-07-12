export const isString = (value: any) => typeof value === 'string';

export const isFunction = (value: any) => typeof value === 'function';

export const isConstructor = (value: any) => value === 'constructor';

export const isEmpty = (array: Array<unknown>): boolean =>
  !(array && array.length > 0);
