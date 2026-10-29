import 'reflect-metadata';

import { ParamType } from '../../enums';
import { MESSAGE_ARGS_METADATA } from '../../constants';
import { FastwaMessage } from '../../interfaces';

export type ParamFactory<TData = any, TMessage = FastwaMessage> = (
  data: TData,
  message: TMessage
) => unknown;

function mergeMetadata(
  args: any,
  paramType: ParamType,
  index: number,
  data: unknown,
  factory?: ParamFactory
) {
  return {
    ...args,
    [`${paramType}:${index}`]: {
      index,
      data,
      factory
    }
  };
}

function paramDecoratorFactory(paramType: ParamType, factory?: ParamFactory) {
  return (data?: unknown): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(MESSAGE_ARGS_METADATA, target.constructor, key) ||
        {};

      Reflect.defineMetadata(
        MESSAGE_ARGS_METADATA,
        mergeMetadata(args, paramType, index, data, factory),
        target.constructor,
        key
      );
    };
}

/**
 * Creates a handler parameter decorator that extracts a value from the
 * received message.
 *
 * For example:
 * ```typescript
 * const Mentions = createParamDecorator(
 *   (data, message: FastwaMessage) => message.text?.match(/@\d+/g) ?? []
 * );
 * ```
 *
 * @param factory Receives the decorator argument and the message
 *
 * @publicApi
 */
export function createParamDecorator<TData = any, TMessage = FastwaMessage>(
  factory: ParamFactory<TData, TMessage>
): (data?: TData) => ParameterDecorator {
  return paramDecoratorFactory(ParamType.CUSTOM, factory as ParamFactory);
}

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
