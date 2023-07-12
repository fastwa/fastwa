import { PipeTransform } from '@fastwa/common';

export class PipesConsumer {
  public async applyPipes<T = any>(
    value: T,
    { metatype, data }: { metatype: any; data: any },
    transforms: PipeTransform[]
  ) {
    return transforms.reduce(async (prev, pipe) => {
      const val = await prev;
      const result = pipe.transform(val, { metatype, data });

      return result;
    }, Promise.resolve(value));
  }
}
