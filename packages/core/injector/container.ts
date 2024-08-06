import {
  Type,
  Interaction,
  IController,
  IProvider,
  DynamicModule
} from '@fastwa/common';

import { Module } from './module';
import { AbstractSocketAdapter } from '../adapters';
import { ModulesContainer } from './modules-container';
import { CollectionContainer } from './collection';
import { ApplicationConfig } from '../application-config';
import { ModuleCompiler } from './compiler';

type ModuleMetatype = Type<any> | DynamicModule;

export class FastwaContainer {
  public lastTimestampAt = Date.now();
  private socketAdapter: AbstractSocketAdapter;
  private readonly modules = new ModulesContainer();
  private readonly collection = new CollectionContainer();
  private readonly moduleCompiler = new ModuleCompiler();
  private readonly dynamicModulesMetadata = new Map<
    string,
    Partial<DynamicModule>
  >();

  constructor(private readonly _applicationConfig: ApplicationConfig) {}

  get applicationConfig(): ApplicationConfig {
    return this._applicationConfig;
  }

  public setSocketAdapter(socket: any) {
    this.socketAdapter = socket;
  }

  public getSocketRef() {
    return this.socketAdapter;
  }

  public getModules() {
    return this.modules;
  }

  public getEvents() {
    return this.collection.events;
  }

  public getReactions() {
    return this.collection.reactions;
  }

  public getCommands() {
    return this.collection.commands;
  }

  public addEvent(name: string, event: Interaction) {
    this.collection.addEvent(name, event);
    return event;
  }

  public addReaction(name: string, reaction: Interaction) {
    this.collection.addReaction(name, reaction);
    return reaction;
  }

  public addCommand(name: string, command: Interaction) {
    this.collection.addCommand(name, command);
    return command;
  }

  public async addModule(metatype) {
    const { type, dynamicMetadata, token } = await this.moduleCompiler.compile(
      metatype
    );

    await this.addDynamicMetadata(token, dynamicMetadata);

    if (this.modules.has(token)) {
      return this.modules.get(token);
    }

    const moduleRef = new Module(type);
    this.modules.set(token, moduleRef);

    return moduleRef;
  }

  public async addDynamicMetadata(
    token: string,
    dynamicModuleMetadata: Partial<DynamicModule>
  ) {
    if (!dynamicModuleMetadata) {
      return;
    }

    this.dynamicModulesMetadata.set(token, dynamicModuleMetadata);

    const { imports } = dynamicModuleMetadata;
    await this.addDynamicModules(imports);
  }

  public async addDynamicModules(modules: ModuleMetatype[]) {
    if (!modules) {
      return;
    }

    await Promise.all(modules.map((module) => this.addModule(module)));
  }

  public addImport(module: Module, token: string) {
    const moduleRef = this.modules.get(token);
    moduleRef.addImport(module);
  }

  public addProvider(provider: IProvider, token: string) {
    const moduleRef = this.modules.get(token);
    moduleRef.addProvider(provider);
  }

  public addController(controller: IController, token: string) {
    const moduleRef = this.modules.get(token);
    moduleRef.addController(controller);
  }

  public addInjectable(injectable: IProvider, token: string) {
    const moduleRef = this.modules.get(token);
    moduleRef.addInjectable(injectable);
  }

  public getDynamicMetadata<K extends Exclude<keyof DynamicModule, 'module'>>(
    token: string,
    metadataKey: K
  ): DynamicModule[K] {
    const metadata = this.dynamicModulesMetadata.get(token);
    return metadata?.[metadataKey] ?? [];
  }

  public clear() {
    this.modules.clear();
  }
}
