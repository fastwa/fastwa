import { PipeTransform } from './features';

export interface IFastwaApplication {
  listen(): Promise<any>;
  close(): Promise<void>;
  useGlobalPipes(...pipes: PipeTransform[]): IFastwaApplication;
}
