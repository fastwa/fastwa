export interface ArgumentsAdapter {
  getMessage<T = any>(): T;
  getAdapter<T = any>(): T;
}

export interface Arguments {
  switchToAdapter(): ArgumentsAdapter;
}
