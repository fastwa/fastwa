import { isFunction, isString } from '@fastwa/common';
import { AnyMessageContent, WASocket } from '@whiskeysockets/baileys';

export class MessageResponseController {
  private socket: WASocket;

  public setSocket(socket: WASocket) {
    this.socket = socket;
  }

  async reply(remoteJid: string, result: AnyMessageContent | string) {
    const response = this.transformToResult(result);
    return await this.socket.sendMessage(remoteJid, response);
  }

  private transformToResult(response: any): AnyMessageContent {
    const hasJSONMethod = (instance: any) => isFunction(instance?.toJSON);

    if (hasJSONMethod(response)) {
      return response.toJSON();
    }

    return isString(response) ? { text: response } : response;
  }
}
