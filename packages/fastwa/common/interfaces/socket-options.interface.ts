import { UserFacingSocketConfig } from '@whiskeysockets/baileys';

export type SocketOptions = UserFacingSocketConfig & {
  saveCreds?: () => Promise<void>;
};
