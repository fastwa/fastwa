import 'reflect-metadata';

import { PROPERTY_DEPS_METADATA, SELF_DECLARED_DEPS_METADATA } from '../..';

export function Inject(token?: any): PropertyDecorator | ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    index?: number
  ) => {
    const type =
      token || Reflect.getMetadata('design:type', target, propertyKey);

    if (!index) {
      let dependencies =
        Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) || [];

      dependencies = [
        ...dependencies,
        { index, param: type, key: propertyKey }
      ];

      Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, dependencies, target);
      return;
    }

    let properties =
      Reflect.getMetadata(PROPERTY_DEPS_METADATA, target.constructor) || [];

    properties = [...properties, { key: propertyKey, type }];

    Reflect.defineMetadata(
      PROPERTY_DEPS_METADATA,
      properties,
      target.constructor
    );
  };
}
