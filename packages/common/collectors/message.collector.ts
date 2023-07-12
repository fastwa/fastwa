import {
  MessageUpsertType,
  WAMessage,
  WASocket
} from '@whiskeysockets/baileys';

import { WAEvent } from '../enums';

interface IMessagesUpsertEvent {
  messages: WAMessage[];
  type: MessageUpsertType;
}

type FilterCallback = (msg: WAMessage) => boolean;

export function createMessageCollector(
  socket: WASocket,
  remoteJid: string,
  timeout: number,
  filter: FilterCallback
): Promise<WAMessage> {
  return new Promise((resolve) => {
    const onMessagesUpsert = ({ messages }: IMessagesUpsertEvent) => {
      const msg = messages[0];
      const jidIsAuthor = msg.key.remoteJid === remoteJid;

      if (jidIsAuthor && filter(msg)) {
        socket.ev.off(WAEvent.MESSAGES_UPSERT, onMessagesUpsert);
        resolve(msg);
      }
    };

    socket.ev.on(WAEvent.MESSAGES_UPSERT, onMessagesUpsert);

    setTimeout(() => {
      socket.ev.off(WAEvent.MESSAGES_UPSERT, onMessagesUpsert);
    }, timeout);
  });
}
