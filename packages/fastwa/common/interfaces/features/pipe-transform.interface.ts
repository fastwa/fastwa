import { Type } from '../type.interface';

export interface ArgumentMetadata {
  readonly metatype?: Type<any> | undefined;
  readonly data?: string | undefined;
}

export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata?: ArgumentMetadata): R;
}
