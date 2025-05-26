import { Injectable, Logger } from '@nestjs/common';
import { Browser, Page } from 'puppeteer';
import { BrowserService } from './services/browser.service';

export interface ImageData {
  img_src: string;
  esa_id: string;
  img_full_size: string;
  title: string;
  credits: string;
  constellation: string;
  fov: string;
  release_date: string;
  type: string;
}

@Injectable()
export abstract class ScrapperService {
  protected readonly logger = new Logger(this.constructor.name);
  protected imageLengthSelector = '';
  protected imageSelector = '';
  protected imageFullSizeSelector = '';
  protected imageTitleSelector = '';
  protected imageEsaIdSelector = '';
  protected creditsSelector = '';
  protected fovSelector = '';
  protected constellationSelector = '';
  protected releaseDateSelector = '';
  protected type = '';

  protected baseUrl = '';
  protected parameters = '';
  protected totalPagesSelector = '';
  protected domain = '';
  protected browser: null | Browser = null;

  constructor(
    private readonly _baseUrl: string,
    private readonly _parameters: string,
    private readonly _totalPagesSelector: string,
    private readonly _domain: string,
    private readonly _imageLengthSelector: string,
    private readonly _imageSelector: string,
    private readonly _imageFullSizeSelector: string,
    private readonly _imageTitleSelector: string,
    private readonly _imageEsaIdSelector: string,
    private readonly _creditsSelector: string,
    private readonly _fovSelector: string,
    private readonly _constellationSelector: string,
    private readonly _releaseDateSelector: string,
    private readonly _type: string,
    protected readonly browserService: BrowserService,
  ) {
    this.imageLengthSelector = this._imageLengthSelector;
    this.imageSelector = this._imageSelector;
    this.imageFullSizeSelector = this._imageFullSizeSelector;
    this.imageTitleSelector = this._imageTitleSelector;
    this.imageEsaIdSelector = this._imageEsaIdSelector;
    this.creditsSelector = this._creditsSelector;
    this.fovSelector = this._fovSelector;
    this.constellationSelector = this._constellationSelector;
    this.releaseDateSelector = this._releaseDateSelector;
    this.type = this._type;

    this.domain = this._domain;
    this.baseUrl = this._baseUrl;
    this.parameters = this._parameters;
    this.totalPagesSelector = this._totalPagesSelector;
  }

  /**
   * Helper to extract text from an element
   */
  async extractText(
    page: Page,
    selector: string,
  ): Promise<string | null | undefined> {
    return page.evaluate((sel) => {
      const element = document.querySelector(sel);
      return element ? element.textContent?.trim() : null;
    }, selector);
  }

  /**
   * Helper to extract attribute from an element
   */
  async extractAttribute(
    page: Page,
    selector: string,
    attribute: string,
  ): Promise<string | null> {
    return page.evaluate(
      (sel, attr) => {
        const element = document.querySelector(sel);
        return element ? element.getAttribute(attr) : null;
      },
      selector,
      attribute,
    );
  }

  /**
   * Wait for a selector to appear on the page with a timeout
   */
  async waitForSelector(
    page: Page,
    selector: string,
    timeoutMs: number = 5000,
  ): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: timeoutMs });
      return true;
    } catch (error) {
      this.logger.error(
        `Error waiting for selector ${selector}: ${error}`,
        error,
      );
      return false;
    }
  }

  /**
   * Start the scraping process
   */
  async startScraping(): Promise<ImageData[]> {
    try {
      const fullImageDataList: ImageData[] = [];
      const browser = await this.browserService.getBrowser();
      const page = await browser?.newPage();
      const totalPages = await this.getTotalPages(page);
      for (let i = 1; i <= totalPages; i++) {
        await page.goto(this.baseUrl + 'page/' + i + this.parameters);
        const imageDataList = await this.scrapePage(page);
        fullImageDataList.push(...imageDataList);
      }
      await this.browserService.closeBrowser();
      return fullImageDataList;
    } catch (error: any) {
      this.logger.error('Error during scraping', error || error);
      return [];
    }
  }

  /**
   * Get the total number of pages to scrape
   */
  async getTotalPages(page: Page): Promise<number> {
    try {
      this.logger.log(this.totalPagesSelector);
      await page.goto(this.baseUrl + 'page/1' + this.parameters);

      const totalPages = await this.extractText(page, this.totalPagesSelector);

      return totalPages ? Number.parseInt(totalPages) : 0;
    } catch (error: any) {
      this.logger.error('Error getting total pages', error || error);
      return 0;
    }
  }

  /**
   * Scrape a single page
   */
  async scrapePage(page: Page): Promise<ImageData[]> {
    const listLength = await page.evaluate((sel: string) => {
      return document.getElementsByClassName(sel).length;
    }, this.imageLengthSelector);

    this.logger.log(`List length: ${this.imageLengthSelector}`);

    const imageDataList: ImageData[] = [];

    for (let i = 1; i <= listLength; i++) {
      const { imageUrl, title } = await this.getImageData(page, i);
      if (!imageUrl || !title) break;
      this.logger.log(`Image URL: ${imageUrl}`);
      const imageDetails = await this.getImageDetails(
        page,
        `https://${this.domain}.org${imageUrl}`,
      );
      if (!imageDetails) break;

      imageDataList.push({
        img_src: this.createImageUrl(imageUrl),
        esa_id: imageDetails.id,
        img_full_size: imageDetails.full_url,
        title: title,
        credits: imageDetails.credits,
        constellation: imageDetails.constellation,
        fov: imageDetails.fov,
        release_date: imageDetails.releaseDate,
        type: this.type,
      });
    }

    return imageDataList;
  }

  /**
   * Get image data from a page
   */
  async getImageData(
    page: Page,
    index: number,
  ): Promise<{ imageUrl: string; title: string }> {
    const imageUrlSelector = this.imageSelector.replace(
      'INDEX',
      index.toString(),
    );
    const titleSelector = this.imageTitleSelector.replace(
      'INDEX',
      index.toString(),
    );

    const imageUrl = await this.extractAttribute(
      page,
      imageUrlSelector,
      'href',
    );
    const title = await this.extractText(page, titleSelector);

    return { imageUrl: imageUrl ?? '', title: title ?? '' };
  }

  /**
   * Get image details from a page
   */
  async getImageDetails(
    page: Page,
    url: string,
  ): Promise<{
    full_url: string;
    id: string;
    credits: string;
    constellation: string;
    fov: string;
    releaseDate: string;
  } | null> {
    await page.goto(url);

    const fullUrl = await this.extractAttribute(
      page,
      this.imageFullSizeSelector,
      'href',
    );
    const id = await this.extractText(page, this.imageEsaIdSelector);
    const credits = await this.extractText(page, this.creditsSelector);
    const fov = await this.extractText(page, this.fovSelector);
    const releaseDate = await this.extractText(page, this.releaseDateSelector);
    const constellation = await this.extractText(
      page,
      this.constellationSelector,
    );
    await page.goBack();

    return {
      full_url: fullUrl ?? '',
      id: id ?? '',
      credits: credits ?? '',
      constellation: constellation ?? '',
      fov: fov ?? '',
      releaseDate: releaseDate ?? '',
    };
  }

  private createImageUrl(endpoint: string): string {
    const base_url = `https://cdn.${this.domain}.org/archives/images/large`;
    return base_url + '/' + endpoint + '.jpg';
  }

  abstract saveImageData(img_data: ImageData[]): Promise<void>;
}
