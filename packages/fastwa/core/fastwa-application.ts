import { IFastwaApplication, Logger, PipeTransform } from '../common';

import { AbstractAdapter } from './adapters';
import { ApplicationConfig } from './application-config';
import { MESSAGES } from './helpers';
import { callModuleBootstrapHook, callModuleInitHook } from './hooks';
import { FastwaContainer } from './injector';
import { InteractionDispatcher, InteractionExplorer } from './interaction';

export class FastwaApplication implements IFastwaApplication {
  private config: ApplicationConfig;
  private adapter: AbstractAdapter;
  private interactionExplorer: InteractionExplorer;

  private readonly logger = new Logger(FastwaApplication.name);

  constructor(private readonly container: FastwaContainer) {
    this.config = this.container.applicationConfig;
    this.adapter = this.container.getAdapter();

    this.interactionExplorer = new InteractionExplorer(this.container);
  }

  public async listen() {
    this.interactionExplorer.explore();
    await this.adapter.listen(new InteractionDispatcher(this.container));

    await this.callInitHook();
    await this.callBootstrapHook();

    this.logger.info(MESSAGES.APPLICATION_READY);

    return this;
  }

  public async close() {
    await this.adapter.close();
  }

  public useGlobalPipes(...pipes: PipeTransform[]) {
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
