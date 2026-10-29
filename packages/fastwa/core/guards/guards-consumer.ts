import { CanActivate, isEmpty } from '../../common';
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

    // Every guard must allow the interaction, evaluated in order
    for (const guard of guards) {
      if (await guard.canActivate(context)) {
        continue;
      }

      return false;
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
