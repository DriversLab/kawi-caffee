import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers';
import { AdminService, AppService } from './services';
import { AdminMiddleware } from './middlewares';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  exports: [AppService],
  providers: [AppService, AdminService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdminMiddleware).forRoutes('/create'); // protect /admin routes
  }
}
