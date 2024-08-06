export class SettlementSignal {
  private readonly _refs = new Set();
  private readonly settledPromise: Promise<unknown>;
  private settleFn: (err?: Error) => void;
  private completed = false;

  constructor() {
    this.settledPromise = new Promise((resolve) => {
      this.settleFn = resolve;
    });
  }

  public complete() {
    this.completed = true;
    this.settleFn();
  }

  public asPromise() {
    return this.settledPromise;
  }

  public addRef(token: string) {
    this._refs.add(token);
  }

  public isCycle(token: string) {
    return !this.complete && this._refs.has(token);
  }
}
