import { CanActivate, GUARDS_METADATA, Type, isEmpty } from '@fastwa/common';
import { iterate } from 'iterare';
import { FastwaContainer } from '../injector';

export class GuardsContext {
  constructor(private readonly container: FastwaContainer) {}

  public create(
    moduleName: string,
    callback: (...args: any[]) => void
  ): CanActivate[] {
    const methodMetadata = Reflect.getMetadata(GUARDS_METADATA, callback);

    if (isEmpty(methodMetadata)) {
      return [];
    }

    return iterate(methodMetadata)
      .filter((guard: any) => guard && (guard.name || guard.canActivate))
      .map((guard: any) => this.getGuardInstance(moduleName, guard))
      .toArray();
  }

  public getGuardInstance(moduleName: string, metatype: Type<any>) {
    const modules = this.container.getModules();
    const moduleRef = modules.get(moduleName);

    const injectables = moduleRef.injectables;
    return injectables.get(metatype).instance;
  }
}
