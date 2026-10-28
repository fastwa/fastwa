import { UserFacingSocketConfig } from '@whiskeysockets/baileys';

import { ReconnectOptions } from './reconnect-options.interface';

export type SocketOptions = UserFacingSocketConfig & {
  saveCreds?: () => Promise<void>;

  /**
   * Automatic reconnection after the connection drops. Defaults to `true`.
   * `restartRequired`, which is part of the pairing flow, always reconnects.
   */
  reconnect?: boolean | ReconnectOptions;
};
