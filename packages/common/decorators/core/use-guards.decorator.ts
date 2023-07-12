import { CanActivate } from '../../interfaces';
import { GUARDS_METADATA } from '../../constants';
import { extendArrayMetadata } from '../../utils';

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
