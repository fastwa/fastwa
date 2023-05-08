import { IProvider, IController } from '@fastwa/common';

export class Module {
  private readonly _imports = new Set<Module>();
  private readonly _providers = new Map();
  private readonly _controllers = new Map();

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
}
