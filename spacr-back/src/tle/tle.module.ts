import { Module } from '@nestjs/common';
import { TleController } from './tle.controller';
import { TleService } from './tle.service';

@Module({
  controllers: [TleController],
  providers: [TleService],
})
export class TleModule {}