import pino from 'pino';

import makeWASocket, {
  AnyMessageContent,
  BaileysEvent,
  BaileysEventMap,
  DisconnectReason,
  WAMessage,
  WASocket
} from '@whiskeysockets/baileys';

import {
  AbstractAdapter,
  AdapterHost,
  LogLevels,
  ReactionMessage,
  SocketConnectionState,
  SocketOptions,
  WAEvent,
  isFunction,
  isString
} from 'fastwa';

import { Boom } from '@hapi/boom';

export class BaileysAdapter extends AbstractAdapter {
  /**
   * The current Baileys socket, replaced when the connection restarts
   */
  public socket: WASocket;

  private host: AdapterHost;

  constructor(private readonly options: SocketOptions) {
    super();
  }

  public async listen(host: AdapterHost) {
    this.host = host;
    this.connect();
  }

  public async reply(message: WAMessage, response: unknown) {
    return this.socket.sendMessage(
      message.key.remoteJid,
      this.toMessageContent(response)
    );
  }

  public async close() {
    this.socket?.end(undefined);
  }

  private connect() {
    const { saveCreds, ...options } = this.options;

    this.socket = makeWASocket({
      ...options,
      logger: pino({ level: LogLevels.SILENT })
    });

    if (saveCreds) {
      this.socket.ev.on(WAEvent.CREDS_UPDATE, saveCreds);
    }

    this.socket.ev.on(WAEvent.CONNECTION_UPDATE, (update) =>
      this.onConnectionUpdate(update)
    );
    this.socket.ev.on(WAEvent.MESSAGES_UPSERT, (upsert) =>
      this.onMessagesUpsert(upsert)
    );
    this.socket.ev.on(WAEvent.MESSAGES_REACTION, (reactions) =>
      this.onReactions(reactions)
    );

    for (const event of this.host.events) {
      this.socket.ev.on(event as BaileysEvent, (payload) =>
        this.host.handleEvent(event, payload)
      );
    }
  }

  private onConnectionUpdate({
    connection,
    lastDisconnect
  }: BaileysEventMap['connection.update']) {
    if (connection !== SocketConnectionState.CLOSE) {
      return;
    }

    const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

    const restartRequired =
      statusCode === DisconnectReason.loggedOut ||
      statusCode === DisconnectReason.restartRequired;

    if (restartRequired) {
      this.connect();
    }
  }

  private async onMessagesUpsert({
    messages,
    type
  }: BaileysEventMap['messages.upsert']) {
    // 'append' messages come from history sync, not from the user
    if (type !== 'notify') {
      return;
    }

    for (const message of messages) {
      await this.host.handleMessage(message);
    }
  }

  private async onReactions(reactions: ReactionMessage[]) {
    for (const reaction of reactions) {
      await this.host.handleReaction(reaction);
    }
  }

  private toMessageContent(response: any): AnyMessageContent {
    if (isFunction(response?.toJSON)) {
      return response.toJSON();
    }

    return isString(response) ? { text: response } : response;
  }
}
