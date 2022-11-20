import {
  Type,
  ICommand,
  IController,
  IProvider
} from '@playwa/common';

import { WAClient } from '@playwa/platform-socket';

import { Module } from './module';
import { ModulesContainer } from './modules-container';
import { CollectionContainer } from './collection';

export class WAContainer {
  private baileysSocket: WAClient;

  private modules = new ModulesContainer();
  private collection = new CollectionContainer();

  public setSocket(socket: any) {
    this.baileysSocket = socket;
  }

  public getSocket() {
    return this.baileysSocket;
  }

  public getModules() {
    return this.modules;
  }

  public getEvents() {
    return this.collection.events;
  }

  public getCommands() {
    return this.collection.commands;
  }

  public getButtons() {
    return this.collection.buttons;
  }

  public addEvent(name: string, event: ICommand) {
    this.collection.addEvent(name, event)
    return event
  }

  public addCommand(name: string, command: ICommand) {
    this.collection.addCommand(name, command)
    return command
  }

  public addButton(name: string, button: ICommand) {
    this.collection.addButton(name, button)
    return button
  }

  public addModule(target: Type<any>) {
    const moduleRef = new Module(target);
    this.modules.set(target.name, moduleRef)
    return moduleRef
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

  public clear() {
    this.modules.clear();
  }
}