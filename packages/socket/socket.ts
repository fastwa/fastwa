import { AbstractSocketClient } from '@fastwa/core/adapters/socket-client';
import { SocketConfig } from '@whiskeysockets/baileys';
import { WebSocket } from 'ws';

// export class FastwaSocket extends AbstractSocketClient {
//   isOpen: boolean;
//   isClosed: boolean;
//   isClosing: boolean;
//   isConnecting: boolean;
//   private socket: WebSocket;

//   constructor() {
//     this.socket = new WebSocket(this.url, {
//       origin: ''
//     });
//   }

//   async connect(): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
//   async close(): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
//   async send(
//     str: string | Uint8Array,
//     callback?: (err?: Error) => void
//   ): boolean {
//     throw new Error('Method not implemented.');
//   }
// }
