export function loadAdapter(loader?: Function) {
  return loader ? loader() : require('@fastwa/client');
}
