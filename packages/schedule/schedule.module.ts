import { Module } from '@fastwa/common';

import { ScheduleService } from './schedule.service';
import { ScheduleExplorer } from './schedule-explorer';

@Module({
  providers: [ScheduleService]
})
export class ScheduleModule {
  static forRoot() {
    return {
      module: ScheduleModule,
      providers: [ScheduleExplorer]
    };
  }
}
