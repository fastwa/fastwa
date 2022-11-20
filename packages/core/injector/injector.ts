import {
  Type,
  InstanceOptions,
  PARAMTYPES_METADATA,
  LoggerService,
} from '@playwa/common';

import { Module } from './module';
import { WAContainer } from './container';
import { MODULE_INIT_MESSAGE } from '../helpers/messages.helper';

export class Injector {
  private logger = new LoggerService('Injector');
  private instancesContainer = new Map<string, any>();

  constructor(private readonly container: WAContainer) {}

  async createInstances(
    modules: Map<string, Module> = this.container.getModules()
  ) {
    for (const [_, module] of modules) {
      await this.resolveProviders(module);
      await this.resolveControllers(module);
    }
  }

  resolveConstructor<T>(target: Type<T>): T | WAContainer {
    if (this.instancesContainer.has(target.name)) {
      return this.instancesContainer.get(target.name);
    }

    const services =
      Reflect.getMetadata(PARAMTYPES_METADATA, target) || [];

    const injections = services.map(i => this.resolveConstructor(i));
    const instance = new target(...injections);
    
    this.instancesContainer.set(target.name, instance);

    this.logger.log(
      MODULE_INIT_MESSAGE(target.name)
    );

    const valueToReplace = this.isContainerMetatype(target)
      ? this.container
      : instance;

    return valueToReplace;
  }

  async resolveControllers(module: Module) {
    const controllers = module.controllers;

    for (const [_, module] of controllers) {
      await this.instanceMetatype(module);
    }
  }

  async resolveProviders(module: Module) {
    const providers = module.providers;

    for (const [_, module] of providers) {
      await this.instanceMetatype(module);
    }
  }

  async instanceMetatype(target: InstanceOptions) {
    const { metatype, instance } = target;

    if (!instance) {
     (target.instance as object) = this.resolveConstructor(metatype);
    }

    return target.instance;
  }

  isContainerMetatype(metatype: Type<any>) {
    return metatype.prototype === WAContainer.prototype;
  }
}