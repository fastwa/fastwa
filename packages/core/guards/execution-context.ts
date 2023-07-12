import { ArgumentsAdapter, Type } from '@fastwa/common';

export class ExecutionContextAdapter {
  constructor(
    private readonly args: any[],
    private readonly constructorRef: Type<any> = null,
    private readonly handler: Function = null
  ) {}

  getClass<T = any>(): Type<T> {
    return this.constructorRef;
  }

  getHandler(): Function {
    return this.handler;
  }

  getArgByIndex<T = any>(index: number): T {
    return this.args[index] as T;
  }

  switchToAdapter(): ArgumentsAdapter {
    return Object.assign(this, {
      getMessage: () => this.getArgByIndex(0),
      getSocket: () => this.getArgByIndex(1)
    });
  }
}
