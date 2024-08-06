import {
  Type,
  InstanceOptions,
  PARAMTYPES_METADATA,
  Logger,
  SELF_DECLARED_DEPS_METADATA
} from '@fastwa/common';

import { Module } from './module';
import { FastwaContainer } from './container';
import { MODULE_INIT_MESSAGE } from '../helpers/messages.helper';
import { SettlementSignal } from './settlement-signal';

export class Injector {
  private logger = new Logger(Injector.name);
  private collection = new Map<string, any>();

  constructor(private readonly container: FastwaContainer) {}

  public createInstancesOfDependencies(
    modules: Map<string, Module> = this.container.getModules()
  ) {
    modules.forEach((module) => {
      this.loadProviders(module);
      this.loadControllers(module);
      this.loadInjectables(module);
    });
  }

  private reflectSelfParams<T>(type: Type<T>): any[] {
    return Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, type) || [];
  }

  private reflectConstructorParams<T>(type: Type<T>): any[] {
    const paramtypes = [
      ...(Reflect.getMetadata(PARAMTYPES_METADATA, type) || [])
    ];

    const selfParams = this.reflectSelfParams<T>(type);

    selfParams.forEach(({ index, param }) => (paramtypes[index] = param));
    return paramtypes;
  }

  public getClassDependencies<T>(metatype: Type<T>): any[] {
    return this.reflectConstructorParams(metatype);
  }

  public resolveInstance<T>(metatype: Type<T>): Type<T> {
    if (this.collection.has(metatype.name)) {
      return this.collection.get(metatype.name);
    }

    const dependencies = this.getClassDependencies(metatype);

    const resolveParam = (param: unknown, index: number) => {
      const type = this.forwardReference(param);
      return this.resolveInstance(type);
    };

    const resolvedDependencies = dependencies.map(resolveParam);
    const instance = new metatype(...resolvedDependencies);

    this.collection.set(metatype.name, instance);

    return this.replaceContainer(metatype, instance) as Type<T>;
  }

  public loadControllers(module: Module) {
    const controllers = module.controllers;

    controllers.forEach((controller) => {
      this.loadInstance(controller);
      this.logger.info(MODULE_INIT_MESSAGE(controller.name));
    });
  }

  public loadProviders(module: Module) {
    const providers = module.providers;

    providers.forEach((provider) => {
      this.loadInstance(provider);
      this.logger.info(MODULE_INIT_MESSAGE(provider.name));
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
    const settlementSignal = this.applySettlementSignal(target);

    if (instance) {
      return settlementSignal.complete();
    }

    target.instance = this.resolveInstance(metatype);

    settlementSignal.complete();

    return target.instance;
  }

  private replaceContainer<T>(metatype: Type<any>, instance: T) {
    return metatype.prototype === FastwaContainer.prototype
      ? this.container
      : instance;
  }

  private forwardReference(param: Type<any> | any) {
    if (!param.forwardRef) {
      return param;
    }

    return param.forwardRef();
  }
  public applySettlementSignal(target: InstanceOptions) {
    const settlementSignal = new SettlementSignal();
    target.settlementSignal = settlementSignal;

    return settlementSignal;
  }
}
