import { Module } from '@nestjs/common';
import { JwstScrappingService } from './services/jwstScrapping.service';
import { PrismaService } from '../prisma.service';
import { ScrapperController } from 'src/scrapper/scrapper.controller';
import { HubbleScrappingService } from 'src/scrapper/services/hubbleScrapping.service';
import { BrowserService } from './services/browser.service';
import { PerseveranceScrappingService } from 'src/scrapper/services/perseveranceScrapping.service';

@Module({
  providers: [
    JwstScrappingService,
    HubbleScrappingService,
    PrismaService,
    BrowserService,
    PerseveranceScrappingService,
  ],
  controllers: [ScrapperController],
  exports: [
    JwstScrappingService,
    HubbleScrappingService,
    BrowserService,
    PerseveranceScrappingService,
  ],
})
export class ScrapperModule {}
