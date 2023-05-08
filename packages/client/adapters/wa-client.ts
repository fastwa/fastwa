import pino from 'pino';

import makeWASocket, {
  DisconnectReason,
  BaileysEvent,
  WASocket
} from '@adiwajshing/baileys';

import {
  WAEvent,
  WAOptions,
  LogLevels,
  ICommand,
  WAConnectionState
} from '@fastwa/common';

import {
  MessageFactory,
  WAContainer,
  MessageProxy,
  ResponseController,
  AbstractWAClient
} from '@fastwa/core';

import { Boom } from '@hapi/boom';

export class WAClient extends AbstractWAClient {
  socket: WASocket;
  options: WAOptions;

  messageProxy: MessageProxy;
  messageFactory: MessageFactory;
  responseController: ResponseController;

  constructor(options: WAOptions, private readonly container: WAContainer) {
    super();

    this.options = options;

    this.messageFactory = new MessageFactory();
    this.messageProxy = new MessageProxy(this.messageFactory);
    this.responseController = new ResponseController(this.messageFactory);
  }

  initSocketClient(restartRequired?: boolean) {
    const { saveCreds, ...options } = this.options;

    this.socket = makeWASocket({
      ...options,
      logger: pino({ level: LogLevels.SILENT })
    });

    if (restartRequired) {
      this.listen();
    }

    this.useSaveCreds(saveCreds);
  }

  listen() {
    this.connectToWhatsapp();

    this.listenCommands(
      this.container.getCommands(),
      this.container.getButtons()
    );

    this.listenEvents(this.container.getEvents());
  }

  connectToWhatsapp() {
    this.socket.ev.on(
      WAEvent.CONNECTION_UPDATE,
      async ({ connection, lastDisconnect }) => {
        if (connection === WAConnectionState.CLOSE) {
          const statusCode = (lastDisconnect.error as Boom)?.output?.statusCode;

          const restartRequired =
            statusCode === DisconnectReason.loggedOut ||
            statusCode === DisconnectReason.restartRequired;

          if (restartRequired) {
            this.initSocketClient(true);
          }
        }
      }
    );
  }

  useSaveCreds(saveCreds: () => Promise<any>) {
    this.socket.ev.on(WAEvent.CREDS_UPDATE, saveCreds);
  }

  listenCommands(
    commands: Map<string, ICommand>,
    buttons: Map<string, ICommand>
  ) {
    const collection = new Map<string, ICommand>([...commands, ...buttons]);

    this.socket.ev.on(WAEvent.MESSAGES_UPSERT, async ({ messages }) => {
      const msg = messages[0];

      const content =
        msg.message?.templateButtonReplyMessage?.selectedId ||
        this.messageFactory.getMessageContent(msg);

      const interaction = this.responseController.getInteraction(
        content,
        collection
      );

      if (!interaction) {
        return;
      }

      const fnHandler = this.messageProxy.createProxy(interaction);
      const result = await fnHandler(msg);

      if (result) {
        this.responseController.reply(this.socket, msg.key.remoteJid, result);
      }
    });
  }

  listenEvents(events: Map<string, ICommand>) {
    events.forEach(({ command, instance, callback }) => {
      this.socket.ev.on(command as BaileysEvent, callback.bind(instance));
    });
  }
}
