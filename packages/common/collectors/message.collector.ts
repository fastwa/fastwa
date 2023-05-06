import { 
  MessageUpsertType, 
  WAMessage, 
  WASocket 
} from '@adiwajshing/baileys';

import { WAEvent } from '../enums';

interface IMessagesUpsertEvent {
  messages: WAMessage[];
  type: MessageUpsertType;
}

type FilterCallback = (message: WAMessage) => boolean;

export function createMessageCollector(
  socket: WASocket,
  remoteJid: string,
  timeout: number,
  filter: FilterCallback
): Promise<WAMessage> {
  return new Promise((resolve, reject) => {
    const onMessage = ({ messages }: IMessagesUpsertEvent) => {
      const msg = messages[0];
      const isFromRemoteJid = msg.key.remoteJid === remoteJid;

      if (isFromRemoteJid && filter(msg)) {
        socket.ev.off(WAEvent.MESSAGES_UPSERT, onMessage);
        resolve(msg);
      }
    }

    socket.ev.on(WAEvent.MESSAGES_UPSERT, onMessage);

    setTimeout(() => {
      socket.ev.off(WAEvent.MESSAGES_UPSERT, onMessage);
    }, timeout);
  });
}
