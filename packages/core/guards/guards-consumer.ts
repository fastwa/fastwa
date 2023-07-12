import { CanActivate, isEmpty } from '@fastwa/common';
import { ExecutionContextAdapter } from './execution-context';

export class GuardsConsumer {
  public async tryActivate(
    guards: CanActivate[],
    args: unknown[],
    instance: object,
    callback: (...args: unknown[]) => unknown
  ) {
    const context = this.createContext(args, instance, callback);

    if (!guards || isEmpty(guards)) {
      return true;
    }

    for (const guard of guards) {
      const result = guard.canActivate(context);
      return result;
    }

    return true;
  }

  public createContext(
    args: unknown[],
    instance: object,
    callback: (...args: unknown[]) => unknown
  ) {
    return new ExecutionContextAdapter(
      args,
      instance.constructor as any,
      callback
    );
  }
}
