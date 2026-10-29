import { FastwaMessage } from '../../common';

import { Collector, CollectorOptions } from './collector';
import { CollectorRegistry } from './collector-registry';

export class MessageCollector extends Collector<FastwaMessage> {
  constructor(
    private readonly registry: CollectorRegistry<FastwaMessage>,
    public readonly chatId: string,
    options?: CollectorOptions<FastwaMessage>
  ) {
    super(options);
    this.registry.add(this);
  }

  public matches({ chatId, chatIdAlt, fromMe }: FastwaMessage) {
    return !fromMe && (chatId === this.chatId || chatIdAlt === this.chatId);
  }

  protected dispose() {
    this.registry.delete(this);
  }
}
