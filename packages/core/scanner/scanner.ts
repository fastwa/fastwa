import 'reflect-metadata';

import { MODULE_METADATA } from '@fastwa/common';
import { Module, WAContainer } from '../injector';

export class DependenciesScanner {
  constructor(private container: WAContainer) {}

  public async scan(module: any) {
    await this.scanModules(module);
    await this.scanModulesDependencies();
  }

  public async scanModules(dynamicModule: any) {
    this.container.addModule(dynamicModule);

    let relatedModules = [];

    const modules = dynamicModule.module
      ? [dynamicModule.module]
      : Reflect.getMetadata(MODULE_METADATA.IMPORTS, dynamicModule);

    for (const innerModule of modules || []) {
      const subModules = await this.scanModules(innerModule);
      relatedModules = relatedModules.concat(subModules);
    }

    if (!dynamicModule) return relatedModules;

    return [dynamicModule].concat(relatedModules);
  }

  public async scanModulesDependencies() {
    const modules = this.container.getModules();

    for (const [moduleName, module] of modules) {
      this.scanImports(module.target, moduleName);
      this.scanProviders(module.target, moduleName);
      this.scanControllers(module.target, moduleName);
    }
  }

  public async scanImports(dynamicModule: Module, moduleName: string) {
    const imports =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, dynamicModule) || [];

    for (const innerImport of imports) {
      this.container.addImport(innerImport, moduleName);
    }
  }

  public async scanProviders(module: Module, moduleName: string) {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) ||
      module.providers ||
      [];

    for (const provider of providers) {
      this.container.addProvider(provider, moduleName);
    }
  }

  public async scanControllers(module: Module, moduleName: string) {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, module) || [];

    for (const controller of controllers) {
      this.container.addController(controller, moduleName);
    }
  }
}
