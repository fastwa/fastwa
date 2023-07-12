import { Interaction } from '@fastwa/common';
import { WASocket } from '@whiskeysockets/baileys';

export abstract class AbstractBaileysAdapter {
  public socket: WASocket;

  abstract listen(): void;
  abstract initSocket(): void;
  abstract connectToSocket(): void;
  abstract useSaveCreds(saveCreds: () => Promise<any>): void;
  abstract loadCommands(commands: Map<string, Interaction>): void;
  abstract loadReactions(reactions: Map<string, Interaction>): void;
  abstract loadEvents(events: Map<string, Interaction>): void;
}
