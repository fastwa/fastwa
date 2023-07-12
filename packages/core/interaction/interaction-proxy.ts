import { WAMessage } from '@whiskeysockets/baileys';

import {
  CanActivate,
  createNullArray,
  Interaction,
  MESSAGE_ARGS_METADATA,
  PARAMTYPES_METADATA,
  PipeTransform,
  Type
} from '@fastwa/common';

import { PipesConsumer } from '../pipes';
import { FastwaContainer } from '../injector';
import { InteractionFactory } from './interaction-factory';
import { GuardsConsumer, GuardsContext } from '../guards';

interface ParamsMetadata {
  index: number;
  extractValue: (msg: WAMessage) => any;
  data: string;
  metatype?: any;
}

export class InteractionProxy {
  constructor(
    private readonly interactionFactory: InteractionFactory,
    private readonly guardsConsumer: GuardsConsumer,
    private readonly guardsContext: GuardsContext,
    private readonly pipesConsumer: PipesConsumer,
    private readonly container: FastwaContainer
  ) {}

  public createProxy(interaction: Interaction) {
    const {
      callback,
      method,
      instance,
      moduleName,
      command: interactionName
    } = interaction;

    const { argsLength, getParamsMetadata, paramTypes } = this.getParamtypes(
      instance,
      method,
      interactionName
    );

    return this.applyCallbackProxy(
      moduleName,
      instance,
      callback,
      getParamsMetadata(),
      argsLength,
      paramTypes
    );
  }

  public applyCallbackProxy(
    moduleName: string,
    instance: Type<object>,
    callback: (...args: any[]) => any,
    paramsMetadata: ParamsMetadata[],
    argsLength: number,
    paramTypes: Type<any>[]
  ) {
    const config = this.container.applicationConfig;

    const paramsOptions = paramsMetadata.map((param) => ({
      ...param,
      metatype: paramTypes[param.index]
    }));

    const pipes = config.getGlobalPipes();
    const guards = this.guardsContext.create(moduleName, callback);

    const fnApplyPipes = this.createPipesFn(pipes, paramsOptions);
    const fnCanActivate = this.createGuardsFn(guards, instance, callback);

    const handler = async (args: any[], msg: WAMessage) => {
      fnApplyPipes && (await fnApplyPipes(args, msg));
      return callback.apply(instance, args);
    };

    return async (msg: WAMessage) => {
      const args = createNullArray(argsLength);
      const canActivate = await fnCanActivate(msg);

      if (canActivate) {
        return await handler(args, msg);
      }
    };
  }

  public getParamtypes(
    instance: Type<object>,
    method: string,
    interactionName: string
  ) {
    const metadata =
      Reflect.getMetadata(
        MESSAGE_ARGS_METADATA,
        instance.constructor,
        method
      ) || {};

    const keys = Object.keys(metadata);

    const getParamsMetadata = () =>
      this.exchangeKeyForValue(keys, metadata, interactionName);

    const paramTypes = Reflect.getMetadata(
      PARAMTYPES_METADATA,
      instance,
      method
    );

    return {
      keys,
      argsLength: keys.length,
      getParamsMetadata,
      paramTypes
    };
  }

  public exchangeKeyForValue(
    keys: string[],
    metadata: any,
    interactionName: string
  ) {
    return keys.map((key) => {
      const { index, data } = metadata[key];
      const paramType = this.interactionFactory.getParamType(key);

      const extractValue = (msg: WAMessage) =>
        this.interactionFactory.paramForValue(
          paramType,
          data,
          msg,
          interactionName
        );

      return {
        index,
        extractValue,
        paramType,
        data
      };
    });
  }

  public createPipesFn(
    pipes: PipeTransform[],
    paramsOptions: ParamsMetadata[]
  ) {
    const pipesFn = async (args: any[], msg: WAMessage) => {
      const resolveParam = async (paramsMetadata: ParamsMetadata) => {
        const { index, metatype, data, extractValue } = paramsMetadata;
        const value = extractValue(msg);

        args[index] = await this.pipesConsumer.applyPipes(
          value,
          { metatype, data },
          pipes
        );
      };

      await Promise.all(paramsOptions.map(resolveParam));
    };

    return paramsOptions.length ? pipesFn : null;
  }

  public createGuardsFn(
    guards: CanActivate[],
    instance: object,
    callback: (...args: any[]) => any
  ) {
    const fnCanActivate = async (msg: WAMessage) => {
      const clientRef = this.container.getClient();

      const canActivate = await this.guardsConsumer.tryActivate(
        guards,
        [msg, clientRef.socket],
        instance,
        callback
      );

      return canActivate;
    };

    return guards.length ? fnCanActivate : null;
  }
}
