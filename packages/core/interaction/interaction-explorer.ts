import 'reflect-metadata';

import { WASocket } from '@whiskeysockets/baileys';

import {
  Type,
  Interaction,
  InstanceOptions,
  INTERACTION_METADATA,
  TYPE_METADATA,
  Logger,
  InteractionType,
  IController
} from '@fastwa/common';

import { FastwaContainer } from '../injector/container';
import { MetadataScanner } from '../scanner/metadata-scanner';
import { MAPPED_COMMAND_MESSAGE } from '../helpers/messages.helper';

import { AbstractBaileysAdapter } from '../adapters';

export class InteractionExplorer {
  private logger = new Logger(InteractionExplorer.name);

  private clientRef: AbstractBaileysAdapter;
  private metadataScanner: MetadataScanner;

  constructor(private readonly container: FastwaContainer) {
    this.clientRef = this.container.getClient();
    this.metadataScanner = new MetadataScanner();
  }

  public explore() {
    const modules = this.container.getModules();

    modules.forEach((module, moduleName) => {
      this.registerCommands(moduleName, module.controllers);
      this.applySocketToProperties(module.controllers);
    });
  }

  public registerCommands(
    moduleName: string,
    controllers: Map<IController, InstanceOptions>
  ) {
    controllers.forEach(({ instance }) => {
      const commands = this.scanForCommands(instance).filter(Boolean);
      this.addInteraction(moduleName, commands);
    });
  }

  public scanForCommands(instance: Type<object>) {
    const prototype = Object.getPrototypeOf(instance);

    return this.metadataScanner.scanMethods(prototype, (method) =>
      this.exploreInteraction(instance, prototype, method)
    );
  }

  public exploreInteraction(
    instance: Type<object>,
    prototype: object,
    method: string
  ) {
    const instanceCallback = instance[method];
    const prototypeCallback = prototype[method];

    const { type, interactionName } = this.reflectMetadata(prototypeCallback);

    return {
      instance,
      command: interactionName,
      callback: instanceCallback,
      method,
      type
    };
  }

  public addInteraction(moduleName: string, collection: Interaction[]) {
    collection.forEach((command) => {
      const { command: interactionName, type } = command;

      switch (type) {
        case InteractionType.COMMAND:
          this.logger.log(MAPPED_COMMAND_MESSAGE(interactionName));
          this.container.addCommand(interactionName, {
            moduleName,
            ...command
          });
          return;

        case InteractionType.REACTION:
          this.container.addReaction(interactionName, command);
          return;

        case InteractionType.ON:
          this.container.addEvent(interactionName, command);
          return;
      }
    });
  }

  public applySocketToProperties(
    controllers: Map<IController, InstanceOptions>
  ) {
    controllers.forEach(({ instance }) => {
      this.assignSocketToProperties(instance, this.clientRef.socket);
    });
  }

  public assignSocketToProperties(instance: Type<object>, clientRef: WASocket) {
    const serverHooks = this.metadataScanner.scanServerHooks(instance);

    for (const property of serverHooks) {
      Reflect.set(instance, property, clientRef);
    }
  }

  public reflectMetadata(target: Type<object>) {
    const type = Reflect.getMetadata(TYPE_METADATA, target);
    const interactionName = Reflect.getMetadata(INTERACTION_METADATA, target);

    return {
      type,
      interactionName
    };
  }
}
