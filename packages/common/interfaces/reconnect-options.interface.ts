export interface ReconnectOptions {
  /**
   * Consecutive reconnect attempts before giving up. Resets once the
   * connection opens. Defaults to `Infinity`.
   */
  maxAttempts?: number;

  /**
   * Delay before the first attempt, doubled on each following one.
   * Defaults to `1000`.
   */
  baseDelayMs?: number;

  /**
   * Upper bound for the delay between attempts. Defaults to `30000`.
   */
  maxDelayMs?: number;

  /**
   * Decides whether to reconnect for a given `DisconnectReason` status code.
   * Defaults to reconnecting on everything except `loggedOut`,
   * `connectionReplaced` and `forbidden`.
   */
  shouldReconnect?: (statusCode: number | undefined) => boolean;

  /**
   * Called when the framework stops reconnecting, either because
   * `shouldReconnect` returned `false` or `maxAttempts` was reached.
   */
  onGiveUp?: (statusCode: number | undefined) => void | Promise<void>;
}
