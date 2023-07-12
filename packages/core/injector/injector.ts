import {
  Type,
  InstanceOptions,
  PARAMTYPES_METADATA,
  Logger
} from '@fastwa/common';

import { Module } from './module';
import { FastwaContainer } from './container';
import { MODULE_INIT_MESSAGE } from '../helpers/messages.helper';

export class Injector {
  private logger = new Logger(Injector.name);
  private instances = new Map<string, any>();

  constructor(private readonly container: FastwaContainer) {}

  public createInstances(
    modules: Map<string, Module> = this.container.getModules()
  ) {
    modules.forEach((module) => {
      this.loadProviders(module);
      this.loadControllers(module);
      this.loadInjectables(module);
    });
  }

  public resolveConstructorParams<T>(target: Type<T>): Type<T> {
    if (this.instances.has(target.name)) {
      return this.instances.get(target.name);
    }

    const services = Reflect.getMetadata(PARAMTYPES_METADATA, target) || [];

    const injections = services.map((i) => this.resolveConstructorParams(i));
    const instance = new target(...injections);

    this.instances.set(target.name, instance);

    const resolvedInstance = this.isContainer(target)
      ? this.container
      : instance;

    return resolvedInstance as Type<T>;
  }

  public loadControllers(module: Module) {
    const controllers = module.controllers;

    controllers.forEach((controller) => {
      this.loadInstance(controller);
      this.logger.log(MODULE_INIT_MESSAGE(controller.name));
    });
  }

  public loadProviders(module: Module) {
    const providers = module.providers;

    providers.forEach((provider) => {
      this.loadInstance(provider);
      this.logger.log(MODULE_INIT_MESSAGE(provider.name));
    });
  }

  public loadInjectables(module: Module) {
    const injectables = module.injectables;

    injectables.forEach((injectable) => {
      this.loadInstance(injectable);
    });
  }

  public loadInstance(target: InstanceOptions) {
    const { metatype, instance } = target;

    if (!instance) {
      target.instance = this.resolveConstructorParams(metatype);
    }

    return target.instance;
  }

  private isContainer(metatype: Type<any>) {
    return metatype.prototype === FastwaContainer.prototype;
  }
}
