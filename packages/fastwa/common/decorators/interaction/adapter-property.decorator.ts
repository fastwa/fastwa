import { ADAPTER_PROPERTY_METADATA } from '../../constants';

/**
 * Creates a controller property decorator whose value is read from the
 * application's adapter on every access, so it stays current when the
 * adapter replaces it (e.g. a client recreated after a reconnect).
 *
 * @param resolve Reads the value from the adapter
 *
 * @publicApi
 */
export function createAdapterPropertyDecorator<TAdapter = any>(
  resolve: (adapter: TAdapter) => unknown
): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.set(target, propertyKey, null);
    Reflect.defineMetadata(
      ADAPTER_PROPERTY_METADATA,
      resolve,
      target,
      propertyKey
    );
  };
}

export const Socket = () =>
  createAdapterPropertyDecorator((adapter: any) => adapter.socket);
