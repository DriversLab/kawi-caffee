import { Module } from '@nestjs/common';
import { AppController } from './controllers';
import { AppService } from './services';

@Module({
  imports: [],
  controllers: [AppController],
  exports: [AppService],
  providers: [AppService],
})
export class AppModule { }
