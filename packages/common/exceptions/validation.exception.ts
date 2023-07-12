export class ValidationException extends Error {
  constructor(public readonly errors: string[]) {
    super();
  }
}
