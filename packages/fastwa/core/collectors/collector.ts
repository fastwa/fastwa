import { EventEmitter } from 'events';

export type CollectorEndReason = 'time' | 'idle' | 'limit' | 'user';

export interface CollectorOptions<T> {
  /**
   * Only items that pass the filter are collected
   */
  filter?: (item: T) => boolean | Promise<boolean>;

  /**
   * How long to collect for, in milliseconds
   */
  time?: number;

  /**
   * How long to wait for the next item, in milliseconds
   */
  idle?: number;

  /**
   * Maximum number of items to collect
   */
  max?: number;

  /**
   * Prevents commands from handling matching items while collecting
   */
  exclusive?: boolean;
}

export interface Collector<T> {
  on(event: 'collect', listener: (item: T) => void): this;
  on(
    event: 'end',
    listener: (collected: T[], reason: CollectorEndReason) => void
  ): this;

  once(event: 'collect', listener: (item: T) => void): this;
  once(
    event: 'end',
    listener: (collected: T[], reason: CollectorEndReason) => void
  ): this;
}

export abstract class Collector<T> extends EventEmitter {
  public readonly collected: T[] = [];
  public ended = false;
  public endReason: CollectorEndReason;

  private timeout: NodeJS.Timeout;
  private idleTimeout: NodeJS.Timeout;

  constructor(public readonly options: CollectorOptions<T> = {}) {
    super();

    if (options.time) {
      this.timeout = setTimeout(() => this.stop('time'), options.time);
    }

    if (options.idle) {
      this.idleTimeout = setTimeout(() => this.stop('idle'), options.idle);
    }
  }

  /**
   * Whether the item belongs to this collector, before filtering
   */
  public abstract matches(item: T): boolean;

  protected abstract dispose(): void;

  public async handle(item: T) {
    if (this.ended) {
      return;
    }

    if (this.options.filter && !(await this.options.filter(item))) {
      return;
    }

    // The collector may have ended while the filter was running
    if (this.ended) {
      return;
    }

    this.collected.push(item);
    this.emit('collect', item);

    if (this.options.max && this.collected.length >= this.options.max) {
      return this.stop('limit');
    }

    this.idleTimeout?.refresh();
  }

  public stop(reason: CollectorEndReason = 'user') {
    if (this.ended) {
      return;
    }

    this.ended = true;
    this.endReason = reason;

    clearTimeout(this.timeout);
    clearTimeout(this.idleTimeout);

    this.dispose();
    this.emit('end', this.collected, reason);
  }
}
