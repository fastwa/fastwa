import 'reflect-metadata';

import { WAEvent, InteractionType } from '@fastwa/common';
import { INTERACTION_METADATA, TYPE_METADATA } from '../../constants';

import { BaileysEventMap } from '@whiskeysockets/baileys';

export interface InteractionMetadata {
  name?: string | RegExp;
  type?: InteractionType;
}

const defaultMetadata = {
  name: '',
  type: InteractionType.COMMAND
};

export const interactionMapping = (
  metadata: InteractionMetadata = defaultMetadata
): MethodDecorator => {
  const { type, name } = metadata;

  return (target, key, descriptor) => {
    Reflect.defineMetadata(INTERACTION_METADATA, name, descriptor.value);
    Reflect.defineMetadata(TYPE_METADATA, type, descriptor.value);

    return descriptor;
  };
};

export const interactionDecoratorFactory =
  (type: InteractionType) => (name: string) => {
    return interactionMapping({
      name,
      type
    });
  };

export const commandDecoratorFactory = () => (name: string | RegExp) => {
  return interactionMapping({
    name,
    type: InteractionType.COMMAND
  });
};

export const eventDecoratorFactory =
  () => (property: keyof BaileysEventMap | WAEvent) => {
    return interactionMapping({
      name: property,
      type: InteractionType.ON
    });
  };

export const Command = commandDecoratorFactory();

export const Reaction = interactionDecoratorFactory(InteractionType.REACTION);

export const Poll = interactionDecoratorFactory(InteractionType.POLL);

export const On = eventDecoratorFactory();
