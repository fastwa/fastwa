import { isFunction } from '@fastwa/common';
import { Module } from '../injector';

export const hasOnModuleInitHook = (instance: any) => {
  return isFunction(instance.onModuleInit);
};

export const callModuleInitHook = async (module: Module) => {
  const [_, moduleClass] = [...module.providers].shift();
  const instance = moduleClass.instance;

  if (hasOnModuleInitHook(instance)) {
    await instance.onModuleInit();
  }
};
