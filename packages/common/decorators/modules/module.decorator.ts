import 'reflect-metadata';

import { ModuleMetadata } from '@fastwa/common';

export function Module(options: ModuleMetadata) {
  return (target: Function) => {
    for (const property in options) {
      Reflect.defineMetadata(property, options[property], target);
    }
  };
}
