import {
  FastwaMessage,
  Interaction,
  mergeKeysAndValues,
  ParamFactory,
  ParamType,
  isEmpty,
  isRegex,
  isString
} from '../../common';

import { createCommandRegex, MESSAGE_REGEX } from '../helpers';

export class InteractionFactory {
  public paramForValue(
    paramType: ParamType,
    data: any,
    message: FastwaMessage,
    interactionName: string | RegExp,
    factory?: ParamFactory
  ) {
    switch (paramType) {
      case ParamType.ARGS: {
        const params = this.getMessageParams(message.text, interactionName);
        return data ? params?.[data] : params;
      }
      case ParamType.CUSTOM:
        return factory(data, message);
      default:
        return null;
    }
  }

  public getMessageParams(
    messageContent: string,
    interactionName: string | RegExp
  ) {
    const keys = this.getKeys(interactionName);
    const regex = this.getRegex(interactionName);

    const values = regex.exec(messageContent);

    if (isEmpty(values)) {
      return;
    }

    return mergeKeysAndValues(keys, values?.slice(1));
  }

  public getKeys(interactionName: string | RegExp) {
    return isString(interactionName)
      ? interactionName.match(MESSAGE_REGEX.PARAM_KEYS) || []
      : [];
  }

  public getRegex(interactionName: string | RegExp) {
    if (isRegex(interactionName)) {
      return interactionName as RegExp;
    }

    const commandParams = (interactionName as string).replace(
      MESSAGE_REGEX.PARAMETER,
      '(.*?)'
    );

    return createCommandRegex(commandParams);
  }

  public getParamType(key: string) {
    const type = key.split(':');
    return Number(type[0]);
  }

  public getInteraction(
    messageContent: string,
    commands: Map<string | RegExp, Interaction>
  ) {
    // Commands match text; media without a caption has none
    if (!isString(messageContent)) {
      return;
    }

    const commandsCollection = [...commands.values()];

    const interaction = commandsCollection.find(({ command }) => {
      const regex = this.getRegex(command);
      return regex.test(messageContent);
    });

    return interaction;
  }
}
