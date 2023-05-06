export interface IWAApplication {
  listen(): Promise<any>;
  useSaveCreds(saveCreds: () => Promise<any>): Promise<any>;
}
