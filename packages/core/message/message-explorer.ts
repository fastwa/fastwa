import 'reflect-metadata';
import { WASocket } from '@adiwajshing/baileys';

import {
  Type,
  ICommand,
  InstanceOptions,
  COMMAND_METADATA,
  TYPE_METADATA,
  LoggerService,
  InteractionType
} from '@fastwa/common';

import { WAContainer } from '../injector/container';
import { MetadataScanner } from '../scanner/metadata-scanner';
import { MAPPED_COMMAND_MESSAGE } from '../helpers/messages.helper';

import { AbstractWAClient } from '../adapters';

export class MessageExplorer {
  private logger = new LoggerService(MessageExplorer.name);

  private socketRef: AbstractWAClient;
  private metadataScanner: MetadataScanner;

  constructor(private readonly container: WAContainer) {
    this.socketRef = this.container.getSocket();
    this.metadataScanner = new MetadataScanner();
  }

  public explore() {
    const modules = this.container.getModules();

    modules.forEach((module) => {
      this.registerCommands(module.controllers);

      this.applySocketToProperties(module.providers);
      this.applySocketToProperties(module.controllers);
    });
  }

  public registerCommands(controllers: Map<string, InstanceOptions>) {
    controllers.forEach(({ instance }) => {
      const commands = this.scanForCommands(instance).filter(Boolean);

      this.applyToContainer(commands);
    });
  }

  public scanForCommands(instance: Type<object>) {
    const prototype = Object.getPrototypeOf(instance);

    return this.metadataScanner.scanMethods(prototype, (method) =>
      this.exploreCommand(instance, prototype, method)
    );
  }

  public exploreCommand(
    instance: Type<object>,
    prototype: object,
    method: string
  ) {
    const instanceCallback = instance[method];
    const prototypeCallback = prototype[method];

    const { type, commandName } = this.getCommandMetadata(prototypeCallback);

    return {
      instance,
      command: commandName,
      callback: instanceCallback,
      method,
      type
    };
  }

  public applyToContainer(allCommands: ICommand[]) {
    (allCommands || []).forEach((command) => {
      const { command: commandName, type } = command;

      switch (type) {
        case InteractionType.COMMAND:
          this.logger.log(MAPPED_COMMAND_MESSAGE(commandName));
          this.container.addCommand(commandName, command);
          break;

        case InteractionType.BUTTON:
          this.container.addButton(commandName, command);
          break;

        case InteractionType.ON:
          this.container.addEvent(commandName, command);
          break;
      }
    });
  }

  public applySocketToProperties(collection: Map<string, InstanceOptions>) {
    collection.forEach(({ instance }) => {
      this.assignSocketToProperties(instance, this.socketRef.socket);
    });
  }

  assignSocketToProperties(instance: Type<object>, socketRef: WASocket) {
    const serverHooks = this.metadataScanner.scanServerHooks(instance);

    for (const property of serverHooks) {
      Reflect.set(instance, property, socketRef);
    }
  }

  public getCommandMetadata(target: Type<object>) {
    const type = Reflect.getMetadata(TYPE_METADATA, target);
    const commandName = Reflect.getMetadata(COMMAND_METADATA, target);

    return {
      type,
      commandName
    };
  }
}
