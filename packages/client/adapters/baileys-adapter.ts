import pino from 'pino';

import makeWASocket, {
  DisconnectReason,
  BaileysEvent,
  WASocket
} from '@whiskeysockets/baileys';

import {
  WAEvent,
  SocketOptions,
  LogLevels,
  Interaction,
  SocketConnectionState
} from '@fastwa/common';

import {
  InteractionFactory,
  FastwaContainer,
  InteractionProxy,
  MessageResponseController,
  AbstractBaileysAdapter
} from '@fastwa/core';

import { Boom } from '@hapi/boom';

import { PipesConsumer } from '@fastwa/core/pipes';
import { GuardsConsumer, GuardsContext } from '@fastwa/core/guards';

export class BaileysAdapter extends AbstractBaileysAdapter {
  socket: WASocket;

  interactionProxy: InteractionProxy;
  interactionFactory: InteractionFactory;
  responseController: MessageResponseController;

  constructor(
    private readonly options: SocketOptions,
    private readonly container: FastwaContainer
  ) {
    super();

    this.interactionFactory = new InteractionFactory();
    this.responseController = new MessageResponseController();

    const guardsContext = new GuardsContext(this.container);
    const guardsConsumer = new GuardsConsumer();
    const pipesConsumer = new PipesConsumer();

    this.interactionProxy = new InteractionProxy(
      this.interactionFactory,
      guardsConsumer,
      guardsContext,
      pipesConsumer,
      this.container
    );
  }

  public initSocket() {
    const { saveCreds, ...options } = this.options;

    this.socket = makeWASocket({
      ...options,
      logger: pino({ level: LogLevels.SILENT })
    });

    this.responseController.setSocket(this.socket);

    saveCreds && this.useSaveCreds(saveCreds);
  }

  public listen() {
    const commands = this.container.getCommands();
    const reactions = this.container.getReactions();
    const events = this.container.getEvents();

    this.connectToSocket();

    this.loadCommands(commands);
    this.loadReactions(reactions);
    this.loadEvents(events);
  }

  public connectToSocket() {
    this.socket.ev.on(
      WAEvent.CONNECTION_UPDATE,
      ({ connection, lastDisconnect }) => {
        if (connection === SocketConnectionState.CLOSE) {
          const statusCode = (lastDisconnect.error as Boom)?.output?.statusCode;

          const restartRequired =
            statusCode === DisconnectReason.loggedOut ||
            statusCode === DisconnectReason.restartRequired;

          if (restartRequired) {
            this.listen();
          }
        }
      }
    );
  }

  public useSaveCreds(saveCreds: () => Promise<void>) {
    this.socket.ev.on(WAEvent.CREDS_UPDATE, saveCreds);
  }

  public loadCommands(commands: Map<string, Interaction>) {
    this.socket.ev.on(WAEvent.MESSAGES_UPSERT, async ({ messages }) => {
      const msg = messages[0];
      const messageContent = this.interactionFactory.getMessageContent(msg);

      const interaction = this.interactionFactory.getInteraction(
        messageContent,
        commands
      );

      if (interaction) {
        const fnProxy = this.interactionProxy.createProxy(interaction);
        const result = await fnProxy(msg);

        result &&
          (await this.responseController.reply(msg.key.remoteJid, result));
      }
    });
  }

  public loadEvents(events: Map<string, Interaction>) {
    events.forEach(({ command, instance, callback }) => {
      this.socket.ev.on(command as BaileysEvent, callback.bind(instance));
    });
  }

  public loadReactions(reactions: Map<string, Interaction>) {
    this.socket.ev.on(WAEvent.MESSAGES_REACTION, async (message) => {
      const msg = message[0];
      const interaction = reactions.get(msg.reaction.text);

      if (interaction) {
        const fnProxy = this.interactionProxy.createProxy(interaction);
        const response = await fnProxy(msg);

        response &&
          (await this.responseController.reply(msg.key.remoteJid, response));
      }
    });
  }
}
