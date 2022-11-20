import {
  LoggerService,
  WAOptions,
  IWAApplication 
} from '@playwa/common';

import { WAClient } from '../platform-socket';

import { Injector } from './injector';
import { WAContainer } from './injector/container';
import { WAApplication } from './wa-app';
import { DependenciesScanner } from './scanner/scanner';

import { MESSAGES } from './helpers/messages.helper';

export class WADefaultFactory {
  private readonly logger = new LoggerService('WAFactory');

  async create<T extends IWAApplication>(
    module: any,
    options: WAOptions
  ): Promise<T> {
    const container = new WAContainer();
    
    const socket = this.createWASocket(
      options,
      container
    );
    
    await this.initialize(
      module,
      container,
      socket,
    );

    return this.createWAInstance<T>(container);
  }

  async initialize(
    module: any,
    container: WAContainer,
    socket: WAClient,
  ) {
    const injector = new Injector(container);
    const dependencieScanner = new DependenciesScanner(container);
    
    try {
      this.logger.log(MESSAGES.APPLICATION_START);

      await dependencieScanner.scan(module);
      await injector.createInstances();

      container.setSocket(socket)
      socket.initSocketClient()
      
    } catch (e) {
      process.abort();
    }
  }

  private createWASocket(
    appOptions: WAOptions,
    container: WAContainer,
  ) {
    return new WAClient(appOptions, container) 
  }

  private createWAInstance<T>(container: WAContainer): T  {
    return new WAApplication(container) as unknown as T;
  }
}

export const WAFactory = new WADefaultFactory();
