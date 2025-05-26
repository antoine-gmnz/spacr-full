import { PerseveranceScrappingService } from 'src/scrapper/services/perseveranceScrapping.service';
import { HubbleScrappingService } from './services/hubbleScrapping.service';
import { JwstScrappingService } from './services/jwstScrapping.service';
import { Controller, Get } from '@nestjs/common';

@Controller('scrapper')
export class ScrapperController {
  constructor(
    private readonly JwstScrappingService: JwstScrappingService,
    private readonly HubbleScrappingService: HubbleScrappingService,
    private readonly perseveranceScrappingService: PerseveranceScrappingService,
  ) {}

  @Get('/esa/jwst')
  async startJwstScrapping(): Promise<void> {
    await this.JwstScrappingService.initScraping();
  }

  @Get('/esa/hubble')
  async startHubbleScrapping(): Promise<void> {
    await this.HubbleScrappingService.initScraping();
  }

  @Get('/nasa/perseverance')
  async startPerseveranceScrapping(): Promise<void> {
    await this.perseveranceScrappingService.initScrapping();
  }
}
