import { CanActivate } from '../../interfaces';
import { GUARDS_METADATA } from '../../constants';
import { extendArrayMetadata } from '../../utils';

/**
 * Decorator that binds guards to the scope of the controller or method,
 * depending on its context.
 *
 * When `@UseGuards` is used at the individual handler level, the guard
 * will apply only to that specific method.
 *
 * @param guards a single guard instance or class, or a list of guard instances
 * or classes.
 *
 * @see [Guards](https://docs.fastwa.com/guards)
 *
 * @publicApi
 */
export function UseGuards(
  ...guards: (CanActivate | Function)[]
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) => {
    if (descriptor) {
      extendArrayMetadata(GUARDS_METADATA, guards, descriptor.value);
      return descriptor;
    }

    extendArrayMetadata(GUARDS_METADATA, guards, target);
    return target;
  };
}
