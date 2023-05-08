import { AnyMessageContent, WASocket } from '@adiwajshing/baileys';

import { MessageFactory } from '@fastwa/core';
import { ICommand, isFunction } from '@fastwa/common';

export const hasToJsonMethod = (instance: any) => {
  return isFunction(instance.toJSON);
};

export class ResponseController {
  constructor(private messageFactory: MessageFactory) {}

  async reply(socket: WASocket, remoteJid: string, message: any) {
    await socket.sendMessage(remoteJid, this.buildMessage(message));
  }

  buildMessage(result: any): AnyMessageContent {
    if (hasToJsonMethod(result)) {
      return result.toJSON();
    }

    return result;
  }

  getInteraction(content: string, commands: Map<string, ICommand>) {
    const allCommands = [...commands.values()];

    const command = allCommands.find(({ command }) => {
      const { commandRegex } = this.messageFactory.prepareCommand(command);
      return commandRegex.exec(content);
    });

    return command;
  }
}
