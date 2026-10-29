import { Module } from 'fastwa';

import { GreetingController } from './greeting.controller.js';
import { GreetingService } from './greeting.service.js';

@Module({
  controllers: [GreetingController],
  providers: [GreetingService]
})
export class GreetingModule { }
