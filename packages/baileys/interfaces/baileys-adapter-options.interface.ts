import { UserFacingSocketConfig } from '@whiskeysockets/baileys';

export type BaileysAdapterOptions = UserFacingSocketConfig & {
  /**
   * Persists the credentials, called on every `creds.update`
   */
  saveCreds?: () => Promise<void>;
};
