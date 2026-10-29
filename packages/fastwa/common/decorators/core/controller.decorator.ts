import { CONTROLLER_METADATA } from '../../constants';

export function Controller() {
  return (target: object) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, true, target);
  };
}
