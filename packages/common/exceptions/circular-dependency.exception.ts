export class CircularDependencyException extends Error {
  constructor(public readonly chain: string[]) {
    super(
      `A circular dependency has been detected: ${chain.join(
        ' -> '
      )}. Use forwardRef(() => YourClass) on both sides of the cycle to resolve it.`
    );
  }
}
