import { Type } from '../type.interface';
import { ModuleMetadata } from './module-metadata.interface';

export interface DynamicModule extends ModuleMetadata {
  module: Type<any>;
}
