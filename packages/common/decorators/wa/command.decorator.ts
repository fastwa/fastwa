import 'reflect-metadata';

import { WAEvent } from '@fastwa/common';
import { InteractionType } from '@fastwa/common/enums/interaction-type.enum';

import { 
  COMMAND_METADATA,
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

export const commandMapping = (
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
    return commandMapping({
      name,
      type: method,
    });
}

export const eventDecoratorFactory = (method: InteractionType) =>
  (property: keyof BaileysEventMap<any> | WAEvent) => {
    return commandMapping({
      name: property,
      type: method,
    });
}

export const Command = commandDecoratorFactory(InteractionType.COMMAND);

export const On   = eventDecoratorFactory(InteractionType.ON);

export const Button = commandDecoratorFactory(InteractionType.BUTTON);
