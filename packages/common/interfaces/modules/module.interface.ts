import { IProvider } from "./provider.interface";
import { IController } from "./controller.interface";

export interface IModuleMetaData {
  imports?: Array<any>;
  controllers?: IController[];
  providers?: IProvider[];
}