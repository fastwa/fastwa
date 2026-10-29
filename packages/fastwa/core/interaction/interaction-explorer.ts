import 'reflect-metadata';

import {
  Type,
  Interaction,
  InstanceOptions,
  INTERACTION_METADATA,
  TYPE_METADATA,
  Logger,
  InteractionType,
  IController
} from '../../common';

import { FastwaContainer } from '../injector/container';
import { MetadataScanner } from '../scanner/metadata-scanner';
import { MAPPED_INTERACTION_MESSAGE } from '../helpers/messages.helper';

export class InteractionExplorer {
  private logger = new Logger(InteractionExplorer.name);

  private metadataScanner: MetadataScanner;

  constructor(private readonly container: FastwaContainer) {
    this.metadataScanner = new MetadataScanner();
  }

  public explore() {
    const modules = this.container.getModules();

    modules.forEach((module, moduleName) => {
      this.registerCommands(moduleName, module.controllers);
      this.bindAdapterProperties(module.controllers);
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
          this.logger.info(MAPPED_INTERACTION_MESSAGE(interactionName));
          this.container.addCommand(interactionName, {
            moduleName,
            ...command
          });
          return;

        case InteractionType.REACTION:
          this.container.addReaction(interactionName as string, command);
          return;

        case InteractionType.ON:
          this.container.addEvent(interactionName as string, command);
          return;
      }
    });
  }

  public bindAdapterProperties(controllers: Map<IController, InstanceOptions>) {
    const adapter = this.container.getAdapter();

    controllers.forEach(({ instance }) => {
      const properties = this.metadataScanner.scanAdapterProperties(instance);

      for (const [property, resolve] of properties) {
        Object.defineProperty(instance, property, {
          get: () => resolve(adapter),
          enumerable: true,
          configurable: true
        });
      }
    });
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
