import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class BrowserService {
  private browser: Browser | null = null;
  protected readonly logger = new Logger(this.constructor.name);

  private async launchBrowser(): Promise<void> {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [`--window-size=1920,1080`],
        });
        this.logger.log('Browser launched successfully');
      }
    } catch (error) {
      this.logger.error('Error launching browser', error);
      throw error;
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.log('Browser closed successfully');
    }
  }

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      await this.launchBrowser();
    }
    return this.browser!;
  }
}
