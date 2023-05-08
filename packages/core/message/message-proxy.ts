import { proto, WAMessage } from '@adiwajshing/baileys';

import {
  createNullArray,
  ICommand,
  isString,
  MESSAGE_ARGS_METADATA,
  PARAMTYPES_METADATA,
  Type
} from '@fastwa/common';

import { MessageFactory } from './message-factory';

export class MessageProxy {
  constructor(private readonly messageFactory: MessageFactory) {}

  createProxy(command: ICommand) {
    const { callback, method, instance, command: commandName } = command;

    const { argsLength, getParamsMetadata, paramTypes } = this.getParamtypes(
      instance,
      method,
      commandName
    );

    return this.applyCallbackProxy(
      instance,
      callback,
      getParamsMetadata(),
      argsLength,
      paramTypes
    );
  }

  public applyCallbackProxy(
    instance: Type<object>,
    callback: (...args: any[]) => any,
    paramsMetadata,
    argsLength,
    paramTypes
  ) {
    const paramsOptions = paramsMetadata.map((param) => ({
      ...param,
      metatype: paramTypes[param.index]
    }));

    const applyPipesFn = this.createPipesFn(paramsOptions);

    const handler = async (args: any[], message: proto.IWebMessageInfo) => {
      applyPipesFn && (await applyPipesFn(args, message));
      return callback.apply(instance, args);
    };

    return async (msg: WAMessage) => {
      const args = createNullArray(argsLength);
      const result = await handler(args, msg);

      const toReply = isString(result) ? { text: result } : result;

      return toReply;
    };
  }

  public getParamtypes(
    instance: Type<object>,
    method: string,
    commandName: string
  ) {
    const metadata =
      Reflect.getMetadata(
        MESSAGE_ARGS_METADATA,
        instance.constructor,
        method
      ) || {};

    const keys = Object.keys(metadata);

    const argsLength = keys.length
      ? Math.max(...keys.map((key) => metadata[key].index)) + 1
      : 0;

    const getParamsMetadata = () =>
      this.exchangeKeyForValue(keys, metadata, commandName);

    const paramTypes = Reflect.getMetadata(
      PARAMTYPES_METADATA,
      instance,
      method
    );

    return {
      keys,
      argsLength,
      getParamsMetadata,
      paramTypes
    };
  }

  public exchangeKeyForValue(
    keys: string[],
    metadata: any,
    commandName: string
  ) {
    return keys.map((key) => {
      const { index, data } = metadata[key];

      const type = this.messageFactory.getParamType(key);

      const extractValue = (msg: WAMessage) =>
        this.messageFactory.paramForValue(type, data, msg, commandName);

      return {
        index,
        extractValue,
        type,
        data
      };
    });
  }

  createPipesFn(paramsOptions) {
    const pipesFn = async (args: any[], msg: WAMessage) => {
      const resolveParam = async (param) => {
        const { index, extractValue, data } = param;

        const value = extractValue(msg, data);
        args[index] = value;
      };

      await Promise.all(paramsOptions.map(resolveParam));
    };

    return paramsOptions.length ? pipesFn : null;
  }
}
