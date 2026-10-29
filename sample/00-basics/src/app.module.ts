import { Module } from 'fastwa';

import { AppController } from './app.controller.js';
import { GreetingService } from './greeting.service.js';

@Module({
  controllers: [AppController],
  providers: [GreetingService]
})
export class AppModule {}
