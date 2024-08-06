import { Logger, SocketOptions, IFastwaApplication } from '@fastwa/common';

import { AbstractSocketAdapter } from './adapters';
import { Injector, FastwaContainer } from './injector';
import { loadAdapter, MESSAGES } from './helpers';

import { FastwaApplication } from './fastwa-application';
import { DependenciesScanner, MetadataScanner } from './scanner';
import { ApplicationConfig } from './application-config';

export class FastwaFactoryStatic {
  private readonly logger = new Logger('FastwaFactory');

  /**
   * Creates an instance of the FastwaApplication.
   * 
   * @param module Entry application module class
   * @param options Options to initalize the socket adapter

   * @returns A promise that resolves to an application instance
   */
  async create<T extends IFastwaApplication>(
    module: any,
    options: SocketOptions
  ): Promise<T> {
    const applicationConfig = new ApplicationConfig();
    const container = new FastwaContainer(applicationConfig);

    const socket = this.createSocketAdapter(options, container);

    await this.initialize(module, container, socket, options.version);

    return this.createFastwaInstance<T>(container);
  }

  async initialize(
    module: any,
    container: FastwaContainer,
    socket: AbstractSocketAdapter,
    version?: number[]
  ) {
    const injector = new Injector(container);
    const metadataScanner = new MetadataScanner();
    const dependenciesScanner = new DependenciesScanner(
      container,
      metadataScanner
    );

    try {
      const release = version.join('.');
      this.logger.log(MESSAGES.APPLICATION_START(release));

      await dependenciesScanner.scan(module);
      injector.createInstancesOfDependencies();

      container.setSocketAdapter(socket);
      socket.initializeSocket();
    } catch (e) {
      process.abort();
    }
  }
  private createSocketAdapter(
    options: SocketOptions,
    container: FastwaContainer
  ) {
    const { SocketAdapter } = loadAdapter(() => require('@fastwa/client'));
    return new SocketAdapter(options, container);
  }

  private createFastwaInstance<T>(container: FastwaContainer): T {
    return new FastwaApplication(container) as unknown as T;
  }
}

/**
 * Use FastwaFactory to create an application instance.
 *
 * ### Entry module
 *
 */
export const FastwaFactory = new FastwaFactoryStatic();
