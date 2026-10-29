import { Module } from 'fastwa';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
