export class UnknownDependencyException extends Error {
  constructor(host: string, index: number) {
    super(
      `Fastwa can't resolve the dependency at index ${index} of ${host}'s constructor. ` +
        'The type resolved to undefined, which usually indicates a circular import. ' +
        'Use @Inject(forwardRef(() => YourClass)) to resolve it.'
    );
  }
}
