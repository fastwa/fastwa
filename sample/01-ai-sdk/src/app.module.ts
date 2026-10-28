import { Module } from '@fastwa/common';

import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';

@Module({
  controllers: [AiController],
  providers: [AiService]
})
export class AppModule {}
