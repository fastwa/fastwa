import { WA_CONTROLLER_METADATA } from '../../constants';

export function Controller() {
  return (target: object) => {
    Reflect.defineMetadata(WA_CONTROLLER_METADATA, true, target);
  };
}
