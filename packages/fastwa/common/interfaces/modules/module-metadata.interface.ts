import { IProvider } from './provider.interface';
import { IController } from './controller.interface';

export interface ModuleMetadata {
  imports?: Array<any>;
  controllers?: IController[];
  providers?: IProvider[];
}
