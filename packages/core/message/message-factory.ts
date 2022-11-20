import { WAMessage } from '@adiwajshing/baileys';
import { mergeKeysAndValues, WAParamTypes } from '@playwa/common';
import { createCommandRegex, MESSAGE_REGEX } from '../helpers';

export class MessageFactory {
  public paramForValue(
    key: WAParamTypes,
    data: string,
    msg: WAMessage,
    commandName: string,
  ) {
    const interaction = this.getMessageContent(msg);
    
    const messageParams = this.getMessageParams(
      interaction, 
      commandName
    );

    return this.exchangeKeyForValue(
      key,
      data,
      msg,
      messageParams,
      interaction,
    )
  }

  public exchangeKeyForValue(
    key: WAParamTypes,
    data: string,
    msg: WAMessage,
    messageParams: any,
    interaction: string,
  ) {
    switch (key) {
      case WAParamTypes.MESSAGE:
        return data && msg ? msg[data] : msg;
      case WAParamTypes.REMOTE_JID:
        return msg.key.remoteJid;
      case WAParamTypes.QUOTED:
        return msg.message.extendedTextMessage?.contextInfo;
      case WAParamTypes.CONTENT:
        return interaction;
      case WAParamTypes.PARAM:
        return data ? messageParams[data] : messageParams;
      default:
        return null;
    }
  }

  public getMessageContent({ message }: WAMessage) {
    const content =
      message?.conversation || 
      message?.extendedTextMessage?.text ||
      message?.listResponseMessage?.title ||
      message?.templateButtonReplyMessage?.selectedDisplayText ||
      message?.ephemeralMessage?.message?.conversation ||
      message?.ephemeralMessage?.message?.extendedTextMessage?.text ||
      message?.ephemeralMessage?.message?.listResponseMessage?.title

    return content
  }

  public getMessageParams(
    interaction: string, 
    commandName: string
  ) {
    const {
      keys,
      commandRegex,
    } = this.prepareCommand(commandName);

    const values = commandRegex.exec(interaction)

    return mergeKeysAndValues(keys, values?.slice(1))
  }

  public prepareCommand(commandName: string) {
    const keys = commandName.match(MESSAGE_REGEX.PARAM_KEYS);
    const commandParams = commandName.replace(MESSAGE_REGEX.VARIABLE, '(.*?)')

    const commandRegex = createCommandRegex(commandParams)

    return {
      keys,
      commandRegex,
    }
  }

  public getParamType(key: string) {
    const keyType = key.split(':')
    return Number(keyType[0])
  }
}
