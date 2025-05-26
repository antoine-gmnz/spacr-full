import { Module } from '@nestjs/common';
import { RoverController } from './rover.controller';
import { RoverService } from './rover.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [RoverController],
  providers: [RoverService, PrismaService],
})
export class RoverModule {}
