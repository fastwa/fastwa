import 'reflect-metadata';
import { IModuleMetaData } from '@fastwa/common';

export function Module(moduleMetaData: IModuleMetaData) {
  return (target: Function) => {
    for (const property in moduleMetaData) {
      Reflect.defineMetadata(property, moduleMetaData[property], target);
    }
  };
}
