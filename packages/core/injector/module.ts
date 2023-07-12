import { IProvider, IController, Type } from '@fastwa/common';

export class Module {
  private readonly _imports = new Set<Module>();
  private readonly _providers = new Map<IProvider, any>();
  private readonly _controllers = new Map<IController, any>();
  private readonly _injectables = new Map<Type<any>, any>();

  constructor(private readonly _target) {}

  get imports() {
    return this._imports;
  }

  get target() {
    return this._target;
  }

  get providers() {
    return this._providers;
  }

  get controllers() {
    return this._controllers;
  }

  get injectables() {
    return this._injectables;
  }

  public addImport(module: Module) {
    this._imports.add(module);
  }

  public addProvider(provider: IProvider) {
    this._providers.set(provider, {
      name: provider.name,
      metatype: provider,
      instance: null
    });

    return provider;
  }

  public addController(controller: IController) {
    this._controllers.set(controller, {
      name: controller.name,
      metatype: controller,
      instance: null
    });

    return controller;
  }

  public addInjectable(injectable: IProvider) {
    this._injectables.set(injectable, {
      name: injectable.name,
      metatype: injectable,
      instance: null
    });

    return injectable;
  }
}
