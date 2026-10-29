import { Logger } from '../../common';

import { Collector } from './collector';

export class CollectorRegistry<T> {
  private readonly logger = new Logger(CollectorRegistry.name);
  private readonly collectors = new Set<Collector<T>>();

  public add(collector: Collector<T>) {
    this.collectors.add(collector);
  }

  public delete(collector: Collector<T>) {
    this.collectors.delete(collector);
  }

  /**
   * Hands the item to every matching collector
   *
   * @returns Whether an exclusive collector claimed the item
   */
  public dispatch(item: T) {
    let claimed = false;

    for (const collector of [...this.collectors]) {
      if (!collector.matches(item)) {
        continue;
      }

      claimed = claimed || !!collector.options.exclusive;

      collector
        .handle(item)
        .catch((error) =>
          this.logger.log(`Collector failed to handle an item: ${error}`)
        );
    }

    return claimed;
  }
}
