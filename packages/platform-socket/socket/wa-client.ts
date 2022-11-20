import pino from 'pino';

import makeWASocket, {
  DisconnectReason,
  BaileysEvent,
  WASocket,
} from "@adiwajshing/baileys";

import { 
  WAEvent,
  WAOptions,
  LogLevels,
  ICommand,
  WAConnectionState,
} from '@playwa/common';

import {
  MessageFactory,
  WAContainer,
  MessageProxy
} from '@playwa/core';

import { Boom } from '@hapi/boom';
import { ResponseController } from './response-controller';

export class WAClient {
  socket: WASocket;
  options: WAOptions;
  
  messageProxy: MessageProxy;
  messageFactory: MessageFactory;
  responseController: ResponseController;

  constructor(
    options: WAOptions,
    private readonly container: WAContainer,
  ) {
    this.options = options;

    this.messageFactory = new MessageFactory();
    this.messageProxy = new MessageProxy(this.messageFactory);
    this.responseController = new ResponseController(this.messageFactory);
  }

  initSocketClient(restartRequired?: boolean) {
    const {
      saveCreds,
      ...options
    } = this.options;

    this.socket = makeWASocket({
      ...options,
      logger: pino({ level: LogLevels.SILENT }),
    });

    if (restartRequired) {
      this.listen()
    }
    
    this.useSaveCreds(saveCreds);
  }
  
  
  listen() {
    this.connectToWhatsapp();

    this.listenCommands(
      this.container.getCommands(),
      this.container.getButtons()
    );

    this.listenEvents(
      this.container.getEvents()
    );
  }

  connectToWhatsapp() {
    this.socket.ev.on(WAEvent.CONNECTION_UPDATE, async ({
      connection,
      lastDisconnect,
    }) => {
      if (connection === WAConnectionState.CLOSE) {
        const statusCode = (lastDisconnect.error as Boom)?.output?.statusCode
        
        const isLogoutOrRestart =
          statusCode === DisconnectReason.loggedOut ||
          statusCode === DisconnectReason.restartRequired;

        if (isLogoutOrRestart) {
            this.initSocketClient(true);
          }
        }
      });
  }

  useSaveCreds(saveCreds: () => Promise<any>) {
    this.socket.ev.on(WAEvent.CREDS_UPDATE, saveCreds)
  }

  listenCommands(...commands: any[]) {
    const collection = new Map<string, ICommand>(...commands);

    this.socket.ev.on(WAEvent.MESSAGES_UPSERT, async ({ messages }) => {
      const msg = messages[0];

      const content = 
        this.messageFactory.getMessageContent(msg) ||
        msg.message?.templateButtonReplyMessage?.selectedId;
        
      const interaction = this.responseController.getInteraction(
        content,
        collection
      );

      if (!interaction) {
        return;
      }

      const handler = this.messageProxy.createProxy(interaction);
      const result = await handler(msg);

      if (result) {
        this.responseController.reply(
          this.socket,
          msg.key.remoteJid,
          result
        );
      }
    });
  }

  listenEvents(events: Map<string, ICommand>) {
    events.forEach(({
      command,
      instance,
      callback,
    }) => {
      this.socket.ev.on(
        command as BaileysEvent,
        callback.bind(instance),
      );
    });
  }
}
