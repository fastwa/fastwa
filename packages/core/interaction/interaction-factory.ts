import { WAMessage } from '@whiskeysockets/baileys';

import {
  Interaction,
  mergeKeysAndValues,
  ParamType,
  isEmpty,
  isRegex,
  isString
} from '@fastwa/common';

import { createCommandRegex, MESSAGE_REGEX } from '../helpers';

export class InteractionFactory {
  public paramForValue(
    paramType: ParamType,
    property: string,
    msg: WAMessage,
    interactionName: string
  ) {
    const messageContent = this.getMessageContent(msg);
    const messageParams = this.getMessageParams(
      messageContent,
      interactionName
    );

    return this.exchangeKeyForValue(
      paramType,
      property,
      msg,
      messageParams,
      messageContent
    );
  }

  public exchangeKeyForValue(
    paramType: ParamType,
    property: string,
    msg: WAMessage,
    messageParams: any,
    messageContent: string
  ) {
    switch (paramType) {
      case ParamType.MESSAGE:
        return property && msg ? msg[property] : msg;
      case ParamType.REMOTE_JID:
        return msg.key.remoteJid;
      case ParamType.QUOTED:
        return msg.message.extendedTextMessage?.contextInfo.quotedMessage;
      case ParamType.CONTENT:
        return messageContent;
      case ParamType.ARGS:
        return property ? messageParams[property] : messageParams;
      default:
        return null;
    }
  }

  public getMessageContent(msg: any) {
    return (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.ephemeralMessage?.message?.conversation ||
      msg.message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      msg.message?.reactionMessage?.text ||
      msg.reaction?.text
    );
  }

  public getMessageParams(messageContent: string, interactionName: string) {
    const keys = this.getKeys(interactionName);
    const regex = this.getRegex(interactionName);

    const values = regex.exec(messageContent);

    if (isEmpty(values)) {
      return;
    }

    return mergeKeysAndValues(keys, values?.slice(1));
  }

  public getKeys(interactionName: string) {
    return isString(interactionName)
      ? interactionName.match(MESSAGE_REGEX.PARAM_KEYS)
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
    commands: Map<string, Interaction>
  ) {
    const commandsCollection = [...commands.values()];

    const interaction = commandsCollection.find(({ command }) => {
      const regex = this.getRegex(command);
      return regex.test(messageContent);
    });

    return interaction;
  }
}
