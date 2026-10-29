import { readFileSync } from 'fs';
import { join } from 'path';

import { Logger, IFastwaApplication } from '../common';

import { AbstractAdapter } from './adapters';
import { Injector, FastwaContainer } from './injector';
import { MESSAGES } from './helpers';

import { FastwaApplication } from './fastwa-application';
import { DependenciesScanner, MetadataScanner } from './scanner';
import { ApplicationConfig } from './application-config';

export class FastwaFactoryStatic {
  private readonly logger = new Logger('FastwaFactory');

  /**
   * Creates an instance of the FastwaApplication.
   *
   * @param module Entry application module class
   * @param adapter Adapter that connects the application to a platform,
   * e.g. `new BaileysAdapter(options)` from `@fastwa/baileys`
   *
   * @returns A promise that resolves to an application instance
   */
  async create<T extends IFastwaApplication = FastwaApplication>(
    module: any,
    adapter: AbstractAdapter
  ): Promise<T> {
    const applicationConfig = new ApplicationConfig();
    const container = new FastwaContainer(applicationConfig);

    container.setAdapter(adapter);
    await this.initialize(module, container);

    return this.createFastwaInstance<T>(container);
  }

  async initialize(module: any, container: FastwaContainer) {
    const injector = new Injector(container);
    const metadataScanner = new MetadataScanner();
    const dependenciesScanner = new DependenciesScanner(
      container,
      metadataScanner
    );

    this.logger.log(MESSAGES.APPLICATION_START(this.getVersion()));

    await dependenciesScanner.scan(module);
    injector.createInstancesOfDependencies();
  }

  private getVersion(): string {
    const pkg = readFileSync(join(__dirname, '..', 'package.json'), 'utf8');
    return JSON.parse(pkg).version;
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
