export function createNullArray(length: number) {
  return Array.from({ length }, () => undefined);
}

export function mergeKeysAndValues(keys: string[], values: any[]) {
  return keys.reduce((acc, curr, index) => {
    return {
      ...acc,
      [curr]: values[index]
    };
  }, {});
}
