import { WAMessage, areJidsSameUser } from '@whiskeysockets/baileys';

import { Collector, CollectorOptions } from './collector';
import { CollectorRegistry } from './collector-registry';

export class MessageCollector extends Collector<WAMessage> {
  constructor(
    private readonly registry: CollectorRegistry<WAMessage>,
    public readonly jid: string,
    options?: CollectorOptions<WAMessage>
  ) {
    super(options);
    this.registry.add(this);
  }

  public matches({ key }: WAMessage) {
    if (key.fromMe) {
      return false;
    }

    return [key.remoteJid, key.remoteJidAlt].some(
      (jid) => !!jid && areJidsSameUser(jid, this.jid)
    );
  }

  protected dispose() {
    this.registry.delete(this);
  }
}
