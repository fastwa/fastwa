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
  ReconnectOptions,
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

// Reconnecting would fail again or fight over the session with another client
const FATAL_DISCONNECT_REASONS = [
  DisconnectReason.loggedOut,
  DisconnectReason.connectionReplaced,
  DisconnectReason.forbidden
];

const DEFAULT_RECONNECT_OPTIONS: Required<Omit<ReconnectOptions, 'onGiveUp'>> =
  {
    maxAttempts: Infinity,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    shouldReconnect: (statusCode) =>
      !FATAL_DISCONNECT_REASONS.includes(statusCode)
  };

export class SocketAdapter extends AbstractSocketAdapter {
  socket: WASocket;

  private reconnectAttempts = 0;
  private readonly logger = new Logger(SocketAdapter.name);
  private readonly credsListeners = new Set<() => Promise<any>>();
  private readonly reconnectOptions: ReconnectOptions | null;

  interactionProxy: InteractionProxy;
  interactionFactory: InteractionFactory;
  responseController: MessageResponseController;

  constructor(
    private readonly options: SocketOptions,
    private readonly container: FastwaContainer
  ) {
    super();

    this.reconnectOptions = this.resolveReconnectOptions(options.reconnect);
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
    const { saveCreds, reconnect, ...options } = this.options;

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
          const statusCode = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;
          this.handleDisconnect(statusCode);
        }
      }
    );
  }

  private resolveReconnectOptions(
    reconnect: SocketOptions['reconnect'] = true
  ): ReconnectOptions | null {
    if (reconnect === false) {
      return null;
    }

    return {
      ...DEFAULT_RECONNECT_OPTIONS,
      ...(reconnect === true ? {} : reconnect)
    };
  }

  private handleDisconnect(statusCode?: number) {
    // restartRequired is part of the pairing flow, not a drop, so it always
    // reconnects immediately and does not count as an attempt
    if (statusCode === DisconnectReason.restartRequired) {
      setTimeout(() => this.reconnect(), 0);
      return;
    }

    if (!this.reconnectOptions) {
      this.logDisconnect(statusCode, 'reconnect is disabled');
      return;
    }

    const { shouldReconnect, maxAttempts, baseDelayMs, maxDelayMs } =
      this.reconnectOptions;

    if (!shouldReconnect(statusCode)) {
      this.giveUp(statusCode, 'not reconnecting');
      return;
    }

    if (this.reconnectAttempts >= maxAttempts) {
      this.giveUp(statusCode, `gave up after ${maxAttempts} attempts`);
      return;
    }

    const delay = Math.min(
      baseDelayMs * 2 ** this.reconnectAttempts++,
      maxDelayMs
    );

    setTimeout(() => this.reconnect(), delay);
  }

  private giveUp(statusCode: number | undefined, reason: string) {
    this.logDisconnect(statusCode, reason);

    // new Promise also catches synchronous throws from the user callback
    new Promise((resolve) =>
      resolve(this.reconnectOptions.onGiveUp?.(statusCode))
    ).catch((error) =>
      this.logger.log(`onGiveUp failed: ${error?.message ?? error}`)
    );
  }

  private logDisconnect(statusCode: number | undefined, reason: string) {
    // Some reasons share a code (connectionLost and timedOut are both 408),
    // so the code is always logged
    const name = DisconnectReason[statusCode];
    const label =
      statusCode === undefined
        ? 'unknown'
        : [statusCode, name].filter(Boolean).join(' ');

    this.logger.log(`Connection closed (${label}), ${reason}`);
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
