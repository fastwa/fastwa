import { Module } from '../../common';

import { CollectorService } from './collector.service';

@Module({
  providers: [CollectorService]
})
export class CollectorModule {}
