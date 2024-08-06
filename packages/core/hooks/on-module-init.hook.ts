import { OnModuleInit, isFunction } from '@fastwa/common';
import { Module } from '../injector';

export const hasOnModuleInitHook = (
  instance: any
): instance is OnModuleInit => {
  return isFunction(instance.onModuleInit);
};

export const callModuleInitHook = async (module: Module) => {
  const [_, moduleClass] = [...module.providers].shift();
  const instance = moduleClass.instance;

  if (moduleClass && hasOnModuleInitHook(instance)) {
    await instance.onModuleInit();
  }
};
