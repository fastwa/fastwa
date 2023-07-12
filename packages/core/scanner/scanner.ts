import 'reflect-metadata';

import { GUARDS_METADATA, MODULE_METADATA, Type } from '@fastwa/common';

import { MetadataScanner } from './metadata-scanner';
import { Module, FastwaContainer } from '../injector';

export class DependenciesScanner {
  constructor(
    private container: FastwaContainer,
    private metadataScanner: MetadataScanner
  ) {}

  public scan(module: any) {
    this.scanModules(module);
    this.scanModulesDependencies();
  }

  public async scanModules(module: any) {
    const moduleDefinition = this.overrideModule(module);
    this.container.addModule(moduleDefinition);

    let relatedModules = [];

    const modules = moduleDefinition.module
      ? [moduleDefinition.module]
      : Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleDefinition);

    for (const innerModule of modules || []) {
      const subModules = await this.scanModules(innerModule);
      relatedModules = relatedModules.concat(subModules);
    }

    if (!moduleDefinition) return relatedModules;

    return [moduleDefinition].concat(relatedModules);
  }

  public scanModulesDependencies() {
    const modules = this.container.getModules();

    for (const [moduleName, module] of modules) {
      this.scanImports(module.target, moduleName);
      this.scanProviders(module.target, moduleName);
      this.scanControllers(module.target, moduleName);
    }
  }

  public scanImports(dynamicModule: Module, moduleName: string) {
    const imports =
      Reflect.getMetadata(MODULE_METADATA.IMPORTS, dynamicModule) || [];

    for (const innerImport of imports) {
      this.container.addImport(innerImport, moduleName);
    }
  }

  public scanProviders(module: Module, moduleName: string) {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) ||
      module.providers ||
      [];

    for (const provider of providers) {
      this.container.addProvider(provider, moduleName);
    }
  }

  public scanControllers(module: Type<any>, moduleName: string) {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, module) || [];

    for (const controller of controllers) {
      this.container.addController(controller, moduleName);
      this.scanInjectables(controller, moduleName);
    }
  }

  public scanInjectables(module: Type<any>, moduleName: string) {
    const getInjectable = (method: string) =>
      Reflect.getMetadata(GUARDS_METADATA, module.prototype[method]) || [];

    const methodInjectables = this.metadataScanner.scanMethods(
      module.prototype,
      (method) => getInjectable(method)
    );

    methodInjectables.forEach((methodInjectable) => {
      methodInjectable.forEach((injectable) =>
        this.container.addInjectable(injectable, moduleName)
      );
    });
  }

  private overrideModule(moduleToOverride: any) {
    return this.isForwardReference(moduleToOverride)
      ? moduleToOverride.forwardRef()
      : moduleToOverride;
  }

  private isForwardReference(module: any) {
    return module && !!module.forwardRef;
  }
}
