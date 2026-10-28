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
  ReactionMessage,
  Logger
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

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;

// Reconnecting would fail again or fight over the session with another client
const FATAL_DISCONNECT_REASONS = [
  DisconnectReason.loggedOut,
  DisconnectReason.connectionReplaced,
  DisconnectReason.forbidden
];

export class SocketAdapter extends AbstractSocketAdapter {
  socket: WASocket;

  private reconnectAttempts = 0;
  private readonly logger = new Logger(SocketAdapter.name);
  private readonly credsListeners = new Set<() => Promise<any>>();

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

  public initializeSocket() {
    const { saveCreds, ...options } = this.options;

    this.socket = makeWASocket({
      ...options,
      logger: pino({ level: LogLevels.SILENT })
    });

    this.responseController.setSocket(this.socket);
    saveCreds && this.credsListeners.add(saveCreds);

    // Re-register on every new socket, so credentials keep being saved
    // after a reconnect
    this.credsListeners.forEach((listener) =>
      this.socket.ev.on(WAEvent.CREDS_UPDATE, listener)
    );
  }

  private reconnect() {
    this.initializeSocket();
    this.listen();
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
        if (connection === SocketConnectionState.OPEN) {
          this.reconnectAttempts = 0;
        }

        if (connection === SocketConnectionState.CLOSE) {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          this.handleDisconnect(statusCode);
        }
      }
    );
  }

  private handleDisconnect(statusCode?: number) {
    if (FATAL_DISCONNECT_REASONS.includes(statusCode)) {
      this.logger.log(
        `Connection closed (${DisconnectReason[statusCode]}), not reconnecting`
      );
      return;
    }

    // restartRequired is expected (e.g. right after pairing), so it is immediate
    const delay =
      statusCode === DisconnectReason.restartRequired
        ? 0
        : Math.min(
            RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts++,
            RECONNECT_MAX_DELAY_MS
          );

    setTimeout(() => this.reconnect(), delay);
  }

  public useSaveCreds(saveCreds: () => Promise<void>) {
    if (this.credsListeners.has(saveCreds)) {
      return;
    }

    this.credsListeners.add(saveCreds);
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
