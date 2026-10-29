import { Module } from 'fastwa';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  controllers: [AiController],
  providers: [AiService]
})
export class AIModule { }
