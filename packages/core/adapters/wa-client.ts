import { WASocket } from "@adiwajshing/baileys";

export abstract class AbstractWAClient {
  public socket: WASocket;

  abstract listen(): void;
  abstract initSocketClient(restartRequired?: boolean): void;
  abstract connectToWhatsapp(): void;
  abstract useSaveCreds(saveCreds: () => Promise<any>): void;
  abstract listenCommands(...commands: any[]): void;
  abstract listenEvents(...commands: any[]): void;
}
