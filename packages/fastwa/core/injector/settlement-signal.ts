// Marks an instance as being resolved. The injector is synchronous, so
// requesting a class whose signal is still pending means a circular dependency.
export class SettlementSignal {
  private completed = false;

  public get isPending() {
    return !this.completed;
  }

  public complete() {
    this.completed = true;
  }
}
