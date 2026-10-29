import { PipeTransform } from './features';

export interface IFastwaApplication {
  listen(): Promise<any>;
  useSaveCreds(saveCreds: () => Promise<any>): IFastwaApplication;
  useGlobalPipes(...pipes: PipeTransform[]): IFastwaApplication;
}
