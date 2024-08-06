import { SocketConfig } from '@whiskeysockets/baileys';

import { URL } from 'url';
import { EventEmitter } from 'events';

export abstract class AbstractSocketClient extends EventEmitter {
  abstract isOpen: boolean;
  abstract isClosed: boolean;
  abstract isClosing: boolean;
  abstract isConnecting: boolean;

  constructor(public url: URL, public config: SocketConfig) {
    super();
    this.setMaxListeners(0);
  }

  abstract connect(): Promise<void>;
  abstract close(): Promise<void>;
  abstract send(
    str: Uint8Array | string,
    callback?: (err?: Error) => void
  ): boolean;
}
