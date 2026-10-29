import { iterate } from 'iterare';
import { plainToClass } from 'class-transformer';
import { ValidationError, ValidatorOptions, validate } from 'class-validator';

import { ValidationException } from '../exceptions';
import { ArgumentMetadata, PipeTransform } from '../interfaces';

export class ValidationPipe implements PipeTransform {
  constructor(private readonly options?: ValidatorOptions) {}

  async transform(value: any, metadata?: ArgumentMetadata) {
    const entity = plainToClass(metadata.metatype, value);
    const errors = await validate(entity, this.options);

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
