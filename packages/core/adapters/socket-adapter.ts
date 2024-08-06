import { WASocket } from '@whiskeysockets/baileys';

export abstract class AbstractSocketAdapter {
  public socket: WASocket;

  abstract listen(): void;
  abstract initializeSocket(): void;
  abstract useSaveCreds(saveCreds: () => Promise<any>): void;
}
