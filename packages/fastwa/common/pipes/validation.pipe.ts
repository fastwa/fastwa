import { iterate } from 'iterare';

import type * as ClassTransformer from 'class-transformer';
import type * as ClassValidator from 'class-validator';

import { ValidationException } from '../exceptions';
import {
  ArgumentMetadata,
  PipeTransform,
  ValidatorOptions
} from '../interfaces';
import { loadPackage } from '../utils/load-package.util';

interface ValidationError {
  constraints?: Record<string, string>;
}

export class ValidationPipe implements PipeTransform {
  private readonly classValidator: typeof ClassValidator;
  private readonly classTransformer: typeof ClassTransformer;

  constructor(private readonly options?: ValidatorOptions) {
    // Loaded only when validation is used, so apps without it don't need them
    this.classValidator = loadPackage('class-validator', 'ValidationPipe', () =>
      require('class-validator')
    );
    this.classTransformer = loadPackage(
      'class-transformer',
      'ValidationPipe',
      () => require('class-transformer')
    );
  }

  async transform(value: any, metadata?: ArgumentMetadata) {
    const entity = this.classTransformer.plainToClass(
      metadata.metatype,
      value
    );
    const errors = await this.classValidator.validate(entity, this.options);

    if (errors.length > 0) {
      const flattenErrors = this.flattenValidationErrors(errors);
      throw new ValidationException(flattenErrors);
    }

    return value;
  }

  protected flattenValidationErrors(
    validationErrors: ValidationError[]
  ): string[] {
    return iterate(validationErrors)
      .filter((item) => !!item.constraints)
      .flatten()
      .map((item) => Object.values(item.constraints))
      .flatten()
      .toArray();
  }
}
