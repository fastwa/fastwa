export function loadClient(loader?: Function) {
  return loader ? loader() : require('@fastwa/client');
};
