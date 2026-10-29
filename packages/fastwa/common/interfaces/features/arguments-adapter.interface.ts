import { WAMessage, WASocket } from '@whiskeysockets/baileys';

export interface ArgumentsAdapter {
  getSocket(): WASocket;
  getMessage(): WAMessage;
}

export interface Arguments {
  switchToAdapter(): ArgumentsAdapter;
}
