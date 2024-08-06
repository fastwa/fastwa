import { OnBootstrap, isFunction } from '@fastwa/common';
import { Module } from '../injector';

export const hasBootstrapHook = (instance: any): instance is OnBootstrap => {
  return isFunction(instance.onBootstrap);
};

export const callModuleBootstrapHook = async (module: Module) => {
  const [_, moduleClass] = [...module.providers].shift();
  const instance = moduleClass.instance;

  if (hasBootstrapHook(instance)) {
    await instance.onBootstrap();
  }
};
