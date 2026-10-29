/**
 * The application side of an adapter: adapters translate platform events
 * into calls to their host
 */
export interface AdapterHost {
  /**
   * Names of the platform events handled with `@On()`
   */
  readonly events: string[];

  handleMessage(message: unknown): Promise<void>;
  handleReaction(reaction: unknown): Promise<void>;
  handleEvent(event: string, payload: unknown): Promise<void>;
}
