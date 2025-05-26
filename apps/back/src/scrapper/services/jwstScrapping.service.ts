import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ImageData, ScrapperService } from 'src/scrapper/scrapper.service';
import { BrowserService } from 'src/scrapper/services/browser.service';
import { ESASpaceTelescope } from 'src/shared/types/ESASpaceTelescope';

const constructorParameters = {
  _imageLengthSelector: 'jg-entry',
  _imageSelector: '#jGallery > div:nth-child(INDEX) > a',
  _imageFullSizeSelector:
    '#body > div > div.col-md-12.col-lg-6.col-xl-18.right-column.order-2.order-sm-2.order-lg-3.order-xl-3 > div:nth-child(3) > div:nth-child(2) > span.archive_dl_text > a',
  _imageTitleSelector: '#jGallery > div:nth-child(INDEX) > div',
  _imageEsaIdSelector:
    '[aria-describedby="About the Image"] > tbody > tr:nth-child(1) > td',

  _domain: 'esawebb',
  _baseUrl: 'https://esawebb.org/images/archive/search/',
  _parameters:
    '?minimum_size=0&ranking=0&instrument=3&instrument=2&instrument=1&instrument=7&instrument=5&instrument=4&instrument=6&facility=1&id=&release_id=&published_since_day=&published_since_month=&published_since_year=&published_until_day=&published_until_month=&published_until_year=&title=&subject_name=&description=&credit=&fov=0',
  _totalPagesSelector:
    '#dark-body > div > div > div.row.statusbar.mx-5.mt-5 > div.col-md-6 > div > ul > li:last-child',
  _creditsSelector:
    '#body > div > div.col-md-12.col-lg-12.col-xl-64.left-column.px-md-4.px-xl-3.tex-justify.order-1.order-sm-1.order-lg-1.order-xl-3 > div.credit > p',
  _fovSelector: '#object_astrometry_div > table > tbody > tr:nth-child(3) > td',
  _constellationSelector:
    '[aria-describedby="About the Object"] > tbody > tr:nth-child(1) > td > a',
  _releaseDateSelector:
    '[aria-describedby="About the Image"] > tbody > tr:nth-child(3) > td',
  _type: ESASpaceTelescope.JAMES_WEBB,
};

/**
 * James Webb Space Telescope Image Scraper Service
 *
 * This service scrapes images from the ESA Webb website and stores them in the database.
 * It runs as a cron job every Sunday at midnight.
 */
@Injectable()
export class JwstScrappingService extends ScrapperService {
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
        data: imageDataList,
        skipDuplicates: true,
      });
      this.logger.log(
        `New JWST images saved: ${imageDataList.map((img) => img.esa_id || 'Untitled').join(', ')}`,
      );

      this.logger.log(`[JWST Scraper]: Image batch has been processed.`);
    } catch (error: any) {
      this.logger.error(`Failed to save image data`, error || error);
    }
  }
}
