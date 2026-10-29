import { WAMessage } from '@whiskeysockets/baileys';
import { Injectable } from '../../common';

import { FastwaContainer } from '../injector/container';
import { CollectorOptions } from './collector';
import { MessageCollector } from './message-collector';

@Injectable()
export class CollectorService {
  constructor(private readonly container: FastwaContainer) {}

  /**
   * Creates a collector for the messages sent to a chat
   *
   * @param jid Chat to collect from (PN or LID)
   */
  public create(jid: string, options?: CollectorOptions<WAMessage>) {
    return new MessageCollector(
      this.container.getMessageCollectors(),
      jid,
      options
    );
  }

  /**
   * Resolves with the collected messages once the collector ends
   */
  public awaitMessages(
    jid: string,
    options?: CollectorOptions<WAMessage>
  ): Promise<WAMessage[]> {
    const collector = this.create(jid, options);
    return new Promise((resolve) => collector.once('end', resolve));
  }

  /**
   * Resolves with the next message, or `undefined` if the collector ends first
   */
  public async awaitMessage(
    jid: string,
    options?: Omit<CollectorOptions<WAMessage>, 'max'>
  ): Promise<WAMessage | undefined> {
    const [message] = await this.awaitMessages(jid, { ...options, max: 1 });
    return message;
  }
}
