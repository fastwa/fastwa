import { Logger, SocketOptions, IFastwaApplication } from '@fastwa/common';

import { AbstractBaileysAdapter } from './adapters';
import { Injector, FastwaContainer } from './injector';
import { loadAdapter, MESSAGES, VERSION_MESSAGE } from './helpers';

import { FastwaApplication } from './fastwa-application';
import { DependenciesScanner, MetadataScanner } from './scanner';
import { ApplicationConfig } from './application-config';

export class FastwaFactoryStatic {
  private readonly logger = new Logger('FastwaFactory');

  async create<T extends IFastwaApplication>(
    module: any,
    appOptions: SocketOptions
  ): Promise<T> {
    const applicationConfig = new ApplicationConfig();
    const container = new FastwaContainer(applicationConfig);

    const clientRef = this.createAdapterProxy(appOptions, container);

    await this.initialize(module, container, clientRef, appOptions.version);

    return this.createFastwaInstance<T>(container);
  }

  async initialize(
    module: any,
    container: FastwaContainer,
    clientRef: AbstractBaileysAdapter,
    version?: number[]
  ) {
    const injector = new Injector(container);
    const metadataScanner = new MetadataScanner();
    const dependenciesScanner = new DependenciesScanner(
      container,
      metadataScanner
    );

    try {
      this.logger.log(MESSAGES.APPLICATION_START);
      this.logger.log(VERSION_MESSAGE(version.join('.')));

      dependenciesScanner.scan(module);
      injector.createInstances();

      container.setClient(clientRef);
      clientRef.initSocket();
    } catch (e) {
      process.abort();
    }
  }

  private createAdapterProxy(
    appOptions: SocketOptions,
    container: FastwaContainer
  ) {
    const { BaileysAdapter } = loadAdapter(() => require('@fastwa/client'));
    return new BaileysAdapter(appOptions, container);
  }

  private createFastwaInstance<T>(container: FastwaContainer): T {
    return new FastwaApplication(container) as unknown as T;
  }
}

export const FastwaFactory = new FastwaFactoryStatic();
