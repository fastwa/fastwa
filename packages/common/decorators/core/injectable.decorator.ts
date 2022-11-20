import { INJECTABLE_METADATA } from '../../constants';

export function Injectable() {
  return (target: object) => {
    Reflect.defineMetadata(INJECTABLE_METADATA, true, target);
  };
}
