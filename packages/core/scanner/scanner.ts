import 'reflect-metadata';

import {
  DynamicModule,
  ForwardReference,
  GUARDS_METADATA,
  MODULE_METADATA,
  Type
} from '@fastwa/common';

import { MetadataScanner } from './metadata-scanner';
import { Module, FastwaContainer } from '../injector';

export class DependenciesScanner {
  constructor(
    private container: FastwaContainer,
    private metadataScanner: MetadataScanner
  ) {}

  private reflectMetadata<T = any>(
    metadataKey: string,
    target: Type<any>
  ): T[] {
    return Reflect.getMetadata(metadataKey, target) || [];
  }

  private reflectImports(module: any) {
    return this.reflectMetadata(MODULE_METADATA.IMPORTS, module);
  }

  private reflectProviders(module: any) {
    return this.reflectMetadata(MODULE_METADATA.PROVIDERS, module);
  }

  private reflectControllers(module: any) {
    return this.reflectMetadata(MODULE_METADATA.CONTROLLERS, module);
  }

  private reflectInjectables(module: any) {
    return this.reflectMetadata(GUARDS_METADATA, module);
  }

  public async scan(module: any) {
    await this.scanModules(module);
    await this.scanModulesDependencies();
  }

  public async scanModules(moduleDefinition: any) {
    await this.insertModule(moduleDefinition);

    let registeredModules = [];

    const modules = !this.isDynamcModule(moduleDefinition)
      ? this.reflectImports(moduleDefinition)
      : [
          ...this.reflectImports(moduleDefinition.module),
          ...(moduleDefinition.imports || [])
        ];

    for (const innerModule of modules) {
      const subModules = await this.scanModules(innerModule);
      registeredModules = registeredModules.concat(subModules);
    }

    if (!moduleDefinition) return registeredModules;

    return [moduleDefinition].concat(registeredModules);
  }

  public async scanModulesDependencies() {
    const modules = this.container.getModules();

    for (const [token, module] of modules) {
      await this.scanImports(module.target, token);
      this.scanProviders(module.target, token);
      this.scanControllers(module.target, token);
    }
  }

  public async scanImports(dynamicModule: Module, token: string) {
    const imports = [
      ...this.reflectImports(dynamicModule),
      ...this.container.getDynamicMetadata(
        token,
        MODULE_METADATA.IMPORTS as 'imports'
      )
    ];

    for (const innerImport of imports) {
      await this.insertImport(innerImport, token);
    }
  }

  public scanProviders(module: Module, token: string) {
    const providers = [
      ...this.reflectProviders(module),
      ...this.container.getDynamicMetadata(
        token,
        MODULE_METADATA.PROVIDERS as 'providers'
      )
    ];

    for (const provider of providers) {
      this.container.addProvider(provider, token);
    }
  }

  public scanControllers(module: Type<any>, token: string) {
    const controllers = this.reflectControllers(module);

    for (const controller of controllers) {
      this.container.addController(controller, token);
      this.scanInjectables(controller, token);
    }
  }

  public scanInjectables(module: Type<any>, token: string) {
    const getInjectable = (method: string) =>
      this.reflectInjectables(module.prototype[method]) || [];

    const methodInjectables = this.metadataScanner.scanMethods(
      module.prototype,
      (method) => getInjectable(method)
    );

    methodInjectables.forEach((methodInjectable) => {
      methodInjectable.forEach((injectable) =>
        this.container.addInjectable(injectable, token)
      );
    });
  }

  public isDynamcModule(
    module: Type<any> | DynamicModule
  ): module is DynamicModule {
    return module && !!(module as DynamicModule).module;
  }

  public isForwardReference(module: any): module is ForwardReference {
    return module && !!(module as ForwardReference).forwardRef;
  }

  public insertModule(moduleDefinition: any) {
    const moduleToAdd = this.isForwardReference(moduleDefinition)
      ? moduleDefinition.forwardRef()
      : moduleDefinition;

    return this.container.addModule(moduleToAdd);
  }

  public async insertImport(module: any, token: string) {
    if (this.isForwardReference(module)) {
      return this.container.addImport(module.forwardRef(), token);
    }

    await this.container.addImport(module, token);
  }
}
