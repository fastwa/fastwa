import pino from 'pino';

import makeWASocket, {
  DisconnectReason,
  BaileysEvent,
  WASocket,
  WAMessage
} from '@whiskeysockets/baileys';

import {
  WAEvent,
  SocketOptions,
  LogLevels,
  Interaction,
  SocketConnectionState,
  ReactionMessage
} from '@fastwa/common';

import {
  InteractionFactory,
  FastwaContainer,
  InteractionProxy,
  MessageResponseController,
  AbstractSocketAdapter
} from '@fastwa/core';

import { Boom } from '@hapi/boom';

import { PipesConsumer } from '@fastwa/core/pipes';
import { GuardsConsumer, GuardsContext } from '@fastwa/core/guards';
import { ValidationException } from '@fastwa/common/exceptions';

export class SocketAdapter extends AbstractSocketAdapter {
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

  public initializeSocket(restartRequired?: boolean) {
    const { saveCreds, ...options } = this.options;

    this.socket = makeWASocket({
      ...options,
      logger: pino({ level: LogLevels.SILENT })
    });

    if (restartRequired) {
      this.listen();
    }

    this.responseController.setSocket(this.socket);
    saveCreds && this.useSaveCreds(saveCreds);
  }

  public listen() {
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.connectToSocket();

    this.setupEventListeners();
    this.setupMessageListeners();
    this.setupReactionListeners();
  }

  private connectToSocket() {
    this.socket.ev.on(
      WAEvent.CONNECTION_UPDATE,
      ({ connection, lastDisconnect }) => {
        if (connection === SocketConnectionState.CLOSE) {
          const statusCode = (lastDisconnect.error as Boom)?.output?.statusCode;

          const restartRequired =
            statusCode === DisconnectReason.loggedOut ||
            statusCode === DisconnectReason.restartRequired;

          restartRequired && this.initializeSocket(restartRequired);
        }
      }
    );
  }

  public useSaveCreds(saveCreds: () => Promise<void>) {
    this.socket.ev.on(WAEvent.CREDS_UPDATE, saveCreds);
  }

  private setupMessageListeners() {
    this.socket.ev.on(WAEvent.MESSAGES_UPSERT, this.handleMessages.bind(this));
  }

  private setupEventListeners() {
    const events = this.container.getEvents();

    events.forEach(({ command, instance, callback }) => {
      this.socket.ev.on(command as BaileysEvent, callback.bind(instance));
    });
  }

  private setupReactionListeners() {
    this.socket.ev.on(
      WAEvent.MESSAGES_REACTION,
      this.handleReactions.bind(this)
    );
  }

  private async handleReactions(message: ReactionMessage[]) {
    const msg = message[0];
    const interaction = this.container.getReactions().get(msg.reaction.text);

    if (interaction) {
      await this.handleInteraction(msg, interaction);
    }
  }

  private async handleMessages({ messages }) {
    const msg = messages[0];
    const messageContent = this.interactionFactory.getMessageContent(msg);

    const interaction = this.interactionFactory.getInteraction(
      messageContent,
      this.container.getCommands()
    );

    if (interaction) {
      await this.handleInteraction(msg, interaction);
    }
  }

  private async handleInteraction(msg: WAMessage, interaction: Interaction) {
    const fnProxy = this.interactionProxy.createProxy(interaction);
    const response = await fnProxy(msg);

    response &&
      (await this.responseController.reply(msg.key.remoteJid, response));
  }
}
