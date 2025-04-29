import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApodController } from './apod/apod.controller';
import { ApodService } from './apod/apod.service';
import { ConfigModule } from '@nestjs/config';
import { JwstModule } from './jwst/jwst.module';
import { PrismaService } from './prisma.service';
import { LaunchesModule } from './launches/launches.module';
import { RoverModule } from './rover/rover.module';
import { TleModule } from './tle/tle.module';
import { AppLoggerMiddleware } from 'src/app-logger-middleware/app-logger-middleware.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    JwstModule,
    LaunchesModule,
    RoverModule,
    TleModule,
  ],
  controllers: [AppController, ApodController],
  providers: [AppService, ApodService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
