import { Module } from '@nestjs/common';
import { JwstController } from './jwst.controller';
import { JwstService } from './jwst.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [JwstController],
  providers: [JwstService, PrismaService],
})
export class JwstModule {}
