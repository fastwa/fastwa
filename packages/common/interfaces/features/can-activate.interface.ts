import { ExecutionContext } from './execution-context.interface';

export interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
