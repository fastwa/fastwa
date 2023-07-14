import 'reflect-metadata';

import { WAMessage } from '@whiskeysockets/baileys';

import { ParamType } from '../../enums';
import { MESSAGE_ARGS_METADATA } from '../../constants';

function mergeMetadata(
  args: any,
  paramType: ParamType,
  index: number,
  data: string
) {
  return {
    ...args,
    [`${paramType}:${index}`]: {
      index,
      data
    }
  };
}

function paramDecoratorFactory(paramType: ParamType) {
  return (data?: string): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(MESSAGE_ARGS_METADATA, target.constructor, key) ||
        {};

      Reflect.defineMetadata(
        MESSAGE_ARGS_METADATA,
        mergeMetadata(args, paramType, index, data),
        target.constructor,
        key
      );
    };
}

export const Message = (property?: keyof WAMessage) =>
  paramDecoratorFactory(ParamType.MESSAGE)(property);

/**
 * Interaction handler parameter decorator. Extracts the entire `args` object
 * property, or optionally a named property of the `args` object, from
 * the `message` object and populates the decorated parameter with that value.
 *
 * For example:
 * ```typescript
 * async create(@Args('name')) name: string)
 * ```
 *
 * @param property name of single property to extract from the `body` object
 *
 * @publicApi
 */
export const Args = (property?: string) =>
  paramDecoratorFactory(ParamType.ARGS)(property);

export const Quoted = () => paramDecoratorFactory(ParamType.QUOTED)(undefined);

export const RemoteJid = () =>
  paramDecoratorFactory(ParamType.REMOTE_JID)(undefined);

export const Content = () =>
  paramDecoratorFactory(ParamType.CONTENT)(undefined);

export const Vote = () => paramDecoratorFactory(ParamType.VOTE)(undefined);
