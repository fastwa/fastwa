import { Module } from 'fastwa';

import { GreetingController } from './greeting.controller';
import { GreetingService } from './greeting.service';

@Module({
  controllers: [GreetingController],
  providers: [GreetingService]
})
export class GreetingModule { }
