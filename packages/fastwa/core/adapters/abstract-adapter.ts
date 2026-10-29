import { FastwaMessage } from '../../common';

import { AdapterHost } from './adapter-host.interface';

/**
 * Connects an application to a messaging platform
 */
export abstract class AbstractAdapter {
  /**
   * Connects to the platform and forwards its events to the host
   */
  abstract listen(host: AdapterHost): Promise<void>;

  /**
   * Sends the value returned by a handler as a reply to the message
   */
  abstract reply(message: FastwaMessage, response: unknown): Promise<unknown>;

  abstract close(): Promise<void>;
}
