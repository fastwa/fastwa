import { proto } from '@adiwajshing/baileys';
import 'reflect-metadata';

import { MESSAGE_ARGS_METADATA } from '../../constants';
import { WAParamTypes } from '../../enums/wa-param.enum';

function mergeMetadata(args, paramtype, index, data) {
  return {
    ...args,
    [`${paramtype}:${index}`]: {
      index,
      data
    }
  };
}

function paramDecoratorFactory(paramtype: WAParamTypes) {
  return (data?: string): ParameterDecorator =>
    (target, key, index) => {
      const args =
        Reflect.getMetadata(MESSAGE_ARGS_METADATA, target.constructor, key) ||
        {};

      Reflect.defineMetadata(
        MESSAGE_ARGS_METADATA,
        mergeMetadata(args, paramtype, index, data),
        target.constructor,
        key
      );
    };
}

export const Message = (property?: keyof proto.IWebMessageInfo) =>
  paramDecoratorFactory(WAParamTypes.MESSAGE)(property);

export const Param = (property?: string) =>
  paramDecoratorFactory(WAParamTypes.PARAM)(property);

export const Quoted = () => paramDecoratorFactory(WAParamTypes.QUOTED)();

export const RemoteJid = () => paramDecoratorFactory(WAParamTypes.REMOTE_JID)();

export const Content = () => paramDecoratorFactory(WAParamTypes.CONTENT)();
