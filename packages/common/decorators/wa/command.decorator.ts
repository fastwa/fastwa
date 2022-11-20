import 'reflect-metadata';

import { WAEvent } from '@playwa/common';
import { InteractionType } from '@playwa/common/enums/interaction-type.enum';

import { 
  COMMAND_METADATA,
  EVENT_METADATA, 
  TYPE_METADATA,
} from '../../constants';

import { BaileysEventMap } from '@adiwajshing/baileys'

export interface ICommandMetadata {
  name?: string | string[];
  type?: InteractionType;
}

export interface IEventMetadata {
  name?: keyof BaileysEventMap<any> | WAEvent;
  type?: InteractionType;
}

const defaultMetadata = {
  name: '',
  type: InteractionType.COMMAND,
}

export const CommandMapping = (
  metadata: ICommandMetadata = defaultMetadata
): MethodDecorator => {
  const {
    type,
    name,
  } = metadata

  return (target, key, descriptor) => {
    Reflect.defineMetadata(COMMAND_METADATA, name, descriptor.value);
    Reflect.defineMetadata(TYPE_METADATA, type, descriptor.value);

    return descriptor
  }
} 

export const commandDecoratorFactory = (method: InteractionType) =>
  (name: string | string[]) => {
    return CommandMapping({
      name,
      type: method,
    });
}

export const eventDecoratorFactory = (method: InteractionType) =>
  (property: keyof BaileysEventMap<any> | WAEvent) => {
    return CommandMapping({
      name: property,
      type: method,
    });
}

/**
 * 
 * Command decorators
 */

export const Command = commandDecoratorFactory(InteractionType.COMMAND);

/**
 * 
 * Events decorators
 */

export const On   = eventDecoratorFactory(InteractionType.ON);

/**
 * 
 * Components decorators
 */

export const ButtonComponent = commandDecoratorFactory(InteractionType.BUTTON);
