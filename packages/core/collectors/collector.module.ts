import { Module } from '@fastwa/common';

import { CollectorService } from './collector.service';

@Module({
  providers: [CollectorService]
})
export class CollectorModule {}
