import { Type, Interaction, IController, IProvider } from '@fastwa/common';

import { Module } from './module';
import { AbstractBaileysAdapter } from '../adapters';
import { ModulesContainer } from './modules-container';
import { CollectionContainer } from './collection';
import { ApplicationConfig } from '../application-config';

export class FastwaContainer {
  private baileysSocket: AbstractBaileysAdapter;

  private modules = new ModulesContainer();
  private collection = new CollectionContainer();

  constructor(private readonly _applicationConfig: ApplicationConfig) {}

  get applicationConfig(): ApplicationConfig {
    return this._applicationConfig;
  }

  public setClient(socket: any) {
    this.baileysSocket = socket;
  }

  public getClient() {
    return this.baileysSocket;
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

  public addModule(target: Type<any>) {
    const moduleRef = new Module(target);
    this.modules.set(target.name, moduleRef);
    return moduleRef;
  }

  public addImport(module: Module, moduleName: string) {
    const moduleRef = this.modules.get(moduleName);
    moduleRef.addImport(module);
  }

  public addProvider(provider: IProvider, moduleName: string) {
    const moduleRef = this.modules.get(moduleName);
    moduleRef.addProvider(provider);
  }

  public addController(controller: IController, moduleName: string) {
    const moduleRef = this.modules.get(moduleName);
    moduleRef.addController(controller);
  }

  public addInjectable(injectable: IProvider, moduleName: string) {
    const moduleRef = this.modules.get(moduleName);
    moduleRef.addInjectable(injectable);
  }

  public clear() {
    this.modules.clear();
  }
}
