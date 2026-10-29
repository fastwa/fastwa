import {
  Type,
  InstanceOptions,
  PARAMTYPES_METADATA,
  Logger,
  SELF_DECLARED_DEPS_METADATA
} from '@fastwa/common';
import {
  CircularDependencyException,
  UnknownDependencyException
} from '@fastwa/common/exceptions';

import { Module } from './module';
import { FastwaContainer } from './container';
import { MODULE_INIT_MESSAGE } from '../helpers/messages.helper';
import { SettlementSignal } from './settlement-signal';

export class Injector {
  private logger = new Logger(Injector.name);
  private collection = new Map<string, any>();
  private signals = new Map<Type<any>, SettlementSignal>();
  private resolving: Type<any>[] = [];
  private placeholders = new Map<Type<any>, any>();

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

    if (this.signals.get(metatype)?.isPending) {
      throw new CircularDependencyException(this.getCycle(metatype));
    }

    const settlementSignal = new SettlementSignal();
    this.signals.set(metatype, settlementSignal);
    this.resolving.push(metatype);

    try {
      const dependencies = this.getClassDependencies(metatype);

      const resolveParam = (param: unknown, index: number) => {
        const type = this.forwardReference(param);

        if (!type) {
          throw new UnknownDependencyException(metatype.name, index);
        }

        // Closes a forwardRef cycle: the class is still being resolved, so it
        // gets a placeholder that becomes the real instance once constructed
        if (
          this.isForwardReference(param) &&
          this.signals.get(type)?.isPending
        ) {
          return this.getPlaceholder(type);
        }

        return this.resolveInstance(type);
      };

      const resolvedDependencies = dependencies.map(resolveParam);
      const created = new metatype(...resolvedDependencies);
      const instance = this.placeholders.has(metatype)
        ? Object.assign(this.placeholders.get(metatype), created)
        : created;

      this.collection.set(metatype.name, instance);
      settlementSignal.complete();

      return this.replaceContainer(metatype, instance) as Type<T>;
    } finally {
      this.resolving.pop();
    }
  }

  private getPlaceholder(metatype: Type<any>) {
    if (!this.placeholders.has(metatype)) {
      this.placeholders.set(metatype, Object.create(metatype.prototype));
    }

    return this.placeholders.get(metatype);
  }

  private getCycle(metatype: Type<any>) {
    const start = this.resolving.indexOf(metatype);
    return [...this.resolving.slice(start), metatype].map(({ name }) => name);
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

    if (instance) {
      return instance;
    }

    target.instance = this.resolveInstance(metatype);
    target.settlementSignal = this.signals.get(metatype);

    return target.instance;
  }

  private replaceContainer<T>(metatype: Type<any>, instance: T) {
    return metatype.prototype === FastwaContainer.prototype
      ? this.container
      : instance;
  }

  private isForwardReference(param: any) {
    return !!param?.forwardRef;
  }

  private forwardReference(param: Type<any> | any) {
    if (!this.isForwardReference(param)) {
      return param;
    }

    return param.forwardRef();
  }
}
