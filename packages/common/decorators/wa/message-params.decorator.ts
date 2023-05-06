import { proto } from '@adiwajshing/baileys';
import 'reflect-metadata'

import { MESSAGE_ARGS_METADATA } from '../../constants';
import { WAParamTypes } from '../../enums/wa-param.enum';

function mergeMetadata(args, paramtype, index, data) {
  return {
    ...args,
    [`${paramtype}:${index}`]: {
      index,
      data
    }
  }
}

function paramDecoratorFactory(paramtype: WAParamTypes) {
  return (data?): ParameterDecorator =>
    (target, key, index) => {
      const args = 
        Reflect.getMetadata(MESSAGE_ARGS_METADATA, target.constructor, key) || {}

      Reflect.defineMetadata(
        MESSAGE_ARGS_METADATA, 
        mergeMetadata(
          args,
          paramtype,
          index,
          data
        ), 
        target.constructor, 
        key
      )
  } 
}

export function Message(property?: keyof proto.IWebMessageInfo) {
  return paramDecoratorFactory(WAParamTypes.MESSAGE)(property);
}

export function Param(property?: string) {
  return paramDecoratorFactory(WAParamTypes.PARAM)(property);
}

export function Quoted() {
  return paramDecoratorFactory(WAParamTypes.QUOTED)();
}

export function RemoteJid() {
  return paramDecoratorFactory(WAParamTypes.REMOTE_JID)();
}

export function Content() {
  return paramDecoratorFactory(WAParamTypes.CONTENT)();
}
