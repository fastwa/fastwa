import { DynamicModule, ForwardReference, Type } from '@fastwa/common';

export interface ModuleFactory {
  type: Type<any>;
  token: string;
  dynamicMetadata?: Partial<DynamicModule>;
}

export class ModuleCompiler {
  public async compile(
    metatype: Type<any> | DynamicModule | Promise<DynamicModule>
  ): Promise<ModuleFactory> {
    const { type, dynamicMetadata } = this.extractMetadata(await metatype);
    const token = type.name;
    return { type, dynamicMetadata, token };
  }

  public extractMetadata(
    metatype: Type<any> | DynamicModule | ForwardReference
  ) {
    if (!this.isDynamicModule(metatype)) {
      return {
        type: this.isForwardReference(metatype)
      };
    }
    const { module: type, ...dynamicMetadata } = metatype;
    return { type, dynamicMetadata };
  }

  public isForwardReference(
    module: Type<any> | DynamicModule | ForwardReference
  ) {
    return (module as ForwardReference).forwardRef
      ? (module as ForwardReference).forwardRef()
      : module;
  }

  public isDynamicModule(
    module: Type<any> | DynamicModule | ForwardReference
  ): module is DynamicModule {
    return !!(module as DynamicModule).module;
  }
}
