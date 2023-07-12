import {
  MESSAGES,
  FastwaContainer,
  InteractionExplorer,
  callModuleBootstrapHook,
  callModuleInitHook,
  AbstractBaileysAdapter
} from '@fastwa/core';

import { Logger } from '@fastwa/common';
import { ApplicationConfig } from './application-config';

export class FastwaApplication {
  private config: ApplicationConfig;
  private clientRef: AbstractBaileysAdapter;
  private InteractionExplorer: InteractionExplorer;

  private readonly logger = new Logger(FastwaApplication.name);

  constructor(private readonly container: FastwaContainer) {
    this.config = this.container.applicationConfig;
    this.clientRef = this.container.getClient();

    this.InteractionExplorer = new InteractionExplorer(this.container);
  }

  public async listen() {
    this.InteractionExplorer.explore();
    this.clientRef.listen();

    await this.callInitHook();
    await this.callBootstrapHook();

    this.logger.log(MESSAGES.APPLICATION_READY);

    return this;
  }

  public async useSaveCreds(saveCreds: () => Promise<any>) {
    this.clientRef.useSaveCreds(saveCreds);
    return this;
  }

  public useGlobalPipes(...pipes: any[]) {
    this.config.useGlobalPipes(...pipes);
    return this;
  }

  protected async callInitHook() {
    const modules = this.container.getModules().values();

    for (const moduleRef of modules) {
      await callModuleInitHook(moduleRef);
    }
  }

  protected async callBootstrapHook() {
    const modules = this.container.getModules().values();

    for (const moduleRef of modules) {
      await callModuleBootstrapHook(moduleRef);
    }
  }
}
