import { MetadataScanner, WAContainer } from '@fastwa/core';
import { Injectable, OnModuleInit, Type } from '@fastwa/common';

import { flatten } from './utils';
import { CRON_OPTIONS } from './constants';
import { ScheduleService } from './schedule.service';

@Injectable()
export class ScheduleExplorer implements OnModuleInit {
  constructor(
    private readonly container: WAContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly scheduleService: ScheduleService
  ) {}

  onModuleInit() {
    this.explore();
  }

  explore() {
    const { providers, controllers } = this.exploreModules();

    const instancesToWrap = [...providers, ...controllers];

    instancesToWrap.forEach(({ instance }) => {
      this.metadataScanner.scanMethods(
        Object.getPrototypeOf(instance),
        (method) => this.lookupCronMetadata(instance, method)
      );
    });
  }

  exploreModules() {
    const modules = [...this.container.getModules().values()];

    const providers = modules.map((item) => [...item.providers.values()]);
    const controllers = modules.map((item) => [...item.controllers.values()]);

    return {
      providers: flatten(providers),
      controllers: flatten(controllers)
    };
  }

  lookupCronMetadata(instance: Type<object>, method: string) {
    const callback = instance[method];
    const cronMetadata = Reflect.getMetadata(CRON_OPTIONS, callback);

    if (cronMetadata) {
      this.scheduleService.createJob(callback, cronMetadata, instance);
    }
  }
}
