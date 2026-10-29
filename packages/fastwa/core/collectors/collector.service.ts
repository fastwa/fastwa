import { FastwaMessage, Injectable } from '../../common';

import { FastwaContainer } from '../injector/container';
import { CollectorOptions } from './collector';
import { MessageCollector } from './message-collector';

@Injectable()
export class CollectorService {
  constructor(private readonly container: FastwaContainer) {}

  /**
   * Creates a collector for the messages sent to a chat
   *
   * @param chatId Chat to collect from (either ID format works when the
   * platform has two, e.g. LID and phone number on WhatsApp)
   */
  public create(chatId: string, options?: CollectorOptions<FastwaMessage>) {
    return new MessageCollector(
      this.container.getMessageCollectors(),
      chatId,
      options
    );
  }

  /**
   * Resolves with the collected messages once the collector ends
   */
  public awaitMessages(
    chatId: string,
    options?: CollectorOptions<FastwaMessage>
  ): Promise<FastwaMessage[]> {
    const collector = this.create(chatId, options);
    return new Promise((resolve) => collector.once('end', resolve));
  }

  /**
   * Resolves with the next message, or `undefined` if the collector ends first
   */
  public async awaitMessage(
    chatId: string,
    options?: Omit<CollectorOptions<FastwaMessage>, 'max'>
  ): Promise<FastwaMessage | undefined> {
    const [message] = await this.awaitMessages(chatId, { ...options, max: 1 });
    return message;
  }
}
