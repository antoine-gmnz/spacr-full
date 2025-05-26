import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ImageData, ScrapperService } from 'src/scrapper/scrapper.service';
import { BrowserService } from 'src/scrapper/services/browser.service';
import { ESASpaceTelescope } from 'src/shared/types/ESASpaceTelescope';

const constructorParameters = {
  _imageLengthSelector: 'picrow',
  _imageSelector:
    '#dark-body > div > div > div.image-list.image-list-300 > div:nth-child(INDEX) > a:nth-child(1)',
  _imageFullSizeSelector:
    '#body > div.row.page > div.col-md-3.right-column > div:nth-child(3) > div:nth-child(2) > span.archive_dl_text > a',
  _imageTitleSelector:
    '#dark-body > div > div > div.image-list.image-list-300 > div:nth-child(INDEX) > a:nth-child(1) > div',
  _imageEsaIdSelector:
    '[aria-describedby="About the Image"] > tbody > tr:nth-child(1) > td',

  _domain: 'esahubble',
  _baseUrl: 'https://esahubble.org/images/archive/search/',
  _parameters:
    '?minimum_size=0&ranking=0&facility=2&id=&release_id=&published_since_day=&published_since_month=&published_since_year=&published_until_day=&published_until_month=&published_until_year=&title=&subject_name=&description=&credit=&fov=0',
  _totalPagesSelector:
    '#dark-body > div > div > div.row.statusbar > div.col-md-6 > div > ul > li:nth-child(8) > a',
  _creditsSelector:
    '#body > div.row.page > div.col-md-9.left-column > div.credit',
  _fovSelector:
    '[aria-describedby="Object coordinates"] tbody > tr:nth-child(3) > td',
  _constellationSelector:
    '[aria-describedby="About the Object"] > tbody > tr:nth-child(3) > td > a',
  _releaseDateSelector:
    '[aria-describedby="About the Image"] > tbody > tr:nth-child(3) > td',
  _type: ESASpaceTelescope.HUBBLE,
};

@Injectable()
export class HubbleScrappingService extends ScrapperService {
  protected readonly logger = new Logger(HubbleScrappingService.name);

  constructor(
    private prismaService: PrismaService,
    protected browserService: BrowserService,
  ) {
    super(
      constructorParameters._baseUrl,
      constructorParameters._parameters,
      constructorParameters._totalPagesSelector,
      constructorParameters._domain,
      constructorParameters._imageLengthSelector,
      constructorParameters._imageSelector,
      constructorParameters._imageFullSizeSelector,
      constructorParameters._imageTitleSelector,
      constructorParameters._imageEsaIdSelector,
      constructorParameters._creditsSelector,
      constructorParameters._fovSelector,
      constructorParameters._constellationSelector,
      constructorParameters._releaseDateSelector,
      constructorParameters._type,
      browserService,
    );
  }

  async initScraping(): Promise<void> {
    const result = await this.startScraping();
    this.logger.log(
      `Scraping completed. Found ${JSON.stringify(result)} images.`,
    );
    await this.saveImageData(result);
  }

  async saveImageData(imageDataList: ImageData[]): Promise<void> {
    try {
      await this.prismaService.eSASpaceTelescopeImage.createMany({
        data: imageDataList.map((img) => ({
          ...img,
          type: this.type,
        })),
        skipDuplicates: true,
      });
      this.logger.log(
        `New Hubble images saved: ${imageDataList.map((img) => img.esa_id || 'Untitled').join(', ')}`,
      );

      this.logger.log(`[Hubble Scraper]: Image batch has been processed.`);
    } catch (error: any) {
      this.logger.error(`Failed to save image data`, error || error);
    }
  }
}
