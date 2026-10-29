import { createAdapterPropertyDecorator } from 'fastwa';

import { BaileysAdapter } from '../adapters/baileys.adapter';

/**
 * Injects the current Baileys socket into a controller property. The
 * property follows the socket when the connection restarts.
 *
 * @publicApi
 */
export const Socket = () =>
  createAdapterPropertyDecorator((adapter: BaileysAdapter) => adapter.socket);
