import { Module } from '@fastwa/common';

import { AppController } from './app.controller.js';
import { GreetingService } from './greeting.service.js';

@Module({
  controllers: [AppController],
  providers: [GreetingService]
})
export class AppModule {}
