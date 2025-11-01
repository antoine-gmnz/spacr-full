import logger from '@adonisjs/core/services/logger'
import puppeteer, { Browser, Page } from 'puppeteer'
import SpaceTelescopeImage from '#models/space-telescope-image'
import SpaceTelescope from '#models/space-telescope'
import ImageUrlService from '#services/image_url_service'
import ESASpaceTelescopeImage from '#models/space-telescope-image'

export interface ESAScrapingConfig {
  domain: string
  baseUrl: string
  parameters: string
  imageLengthSelector: string
  imageSelector: string
  imageFullSizeSelector: string
  imageTitleSelector: string
  imageEsaIdSelector: string
  creditsSelector: string
  fovSelector: string
  constellationSelector: string
  releaseDateSelector: string
  totalPagesSelector: string
  type: 'JWST' | 'HUBBLE' | 'OTHER'
}

export interface ScrapedImageData {
  esaId: string
  title: string
  credits?: string
  constellation?: string
  fov?: string
  imgHash: string
  releaseDate?: string
  type: 'JWST' | 'HUBBLE' | 'OTHER'
}

export default class SpaceTelescopeImagesScrappingService {
  private browser: Browser | null = null

  // Configuration for different ESA telescopes
  private static readonly SCRAPING_CONFIGS: Record<string, ESAScrapingConfig> = {
    JWST: {
      domain: 'esawebb',
      baseUrl: 'https://esawebb.org/images/archive/search/',
      parameters:
        '?minimum_size=0&ranking=0&instrument=3&instrument=2&instrument=1&instrument=7&instrument=5&instrument=4&instrument=6&facility=1&id=&release_id=&published_since_day=&published_since_month=&published_since_year=&published_until_day=&published_until_month=&published_until_year=&title=&subject_name=&description=&credit=&fov=0',
      imageLengthSelector: 'jg-entry',
      imageSelector: '#jGallery > div:nth-child(INDEX) > a',
      imageFullSizeSelector:
        '#body > div > div.col-md-12.col-lg-6.col-xl-18.right-column.order-2.order-sm-2.order-lg-3.order-xl-3 > div:nth-child(3) > div:nth-child(2) > span.archive_dl_text > a',
      imageTitleSelector: '#jGallery > div:nth-child(INDEX) > div',
      imageEsaIdSelector: '[aria-describedby="About the Image"] > tbody > tr:nth-child(1) > td',
      creditsSelector:
        '#body > div > div.col-md-12.col-lg-12.col-xl-64.left-column.px-md-4.px-xl-3.tex-justify.order-1.order-sm-1.order-lg-1.order-xl-3 > div.credit > p',
      fovSelector: '#object_astrometry_div > table > tbody > tr:nth-child(3) > td',
      constellationSelector:
        '[aria-describedby="About the Object"] > tbody > tr:nth-child(1) > td > a',
      releaseDateSelector: '[aria-describedby="About the Image"] > tbody > tr:nth-child(3) > td',
      totalPagesSelector:
        '#dark-body > div > div > div.row.statusbar.mx-5.mt-5 > div.col-md-6 > div > ul > li:last-child',
      type: 'JWST',
    },
    HUBBLE: {
      domain: 'esahubble',
      baseUrl: 'https://esahubble.org/images/archive/search/',
      parameters:
        '?minimum_size=0&ranking=0&facility=2&id=&release_id=&published_since_day=&published_since_month=&published_since_year=&published_until_day=&published_until_month=&published_until_year=&title=&subject_name=&description=&credit=&fov=0',
      imageLengthSelector: 'picrow',
      imageSelector:
        '#dark-body > div > div > div.image-list.image-list-300 > div:nth-child(INDEX) > a:nth-child(1)',
      imageFullSizeSelector:
        '#body > div.row.page > div.col-md-3.right-column > div:nth-child(3) > div:nth-child(2) > span.archive_dl_text > a',
      imageTitleSelector:
        '#dark-body > div > div > div.image-list.image-list-300 > div:nth-child(INDEX) > a:nth-child(1) > div',
      imageEsaIdSelector: '[aria-describedby="About the Image"] > tbody > tr:nth-child(1) > td',
      creditsSelector: '#body > div.row.page > div.col-md-9.left-column > div.credit',
      fovSelector: '[aria-describedby="Object coordinates"] tbody > tr:nth-child(3) > td',
      constellationSelector:
        '[aria-describedby="About the Object"] > tbody > tr:nth-child(3) > td > a',
      releaseDateSelector: '[aria-describedby="About the Image"] > tbody > tr:nth-child(3) > td',
      totalPagesSelector:
        '#dark-body > div > div > div.row.statusbar > div.col-md-6 > div > ul > li:nth-child(8) > a',
      type: 'HUBBLE',
    },
  }

  /**
   * Heavy initial scraping - can run for hours
   */
  async performInitialHeavyScraping(): Promise<void> {
    logger.info('Starting heavy initial ESA scraping task...')

    try {
      await this.initBrowser()

      // Scrape all ESA telescope images
      const allImages: ScrapedImageData[] = []

      for (const [telescope, config] of Object.entries(
        SpaceTelescopeImagesScrappingService.SCRAPING_CONFIGS
      )) {
        logger.info(`Starting scraping for ${telescope}...`)
        const images = await this.scrapeAllTelescopeImages(config)
        allImages.push(...images)
        logger.info(`Completed ${telescope} scraping: ${images.length} images found`)
      }

      // Batch save to optimized database
      // await this.batchSaveImages(allImages)

      logger.info(`Initial ESA scraping completed: ${allImages.length} total images processed`)
    } finally {
      await this.closeBrowser()
    }
  }

  /**
   * Light recurring update - should complete in minutes
   */
  async performLightUpdate(): Promise<void> {
    logger.info('Running light ESA update task...')

    try {
      await this.initBrowser()

      // Scrape only recent updates (last few pages)
      const recentImages: ScrapedImageData[] = []

      for (const [telescope, config] of Object.entries(
        SpaceTelescopeImagesScrappingService.SCRAPING_CONFIGS
      )) {
        logger.info(`Checking recent updates for ${telescope}...`)
        const images = await this.scrapeRecentTelescopeImages(config)
        recentImages.push(...images)
        logger.info(`Recent ${telescope} updates: ${images.length} new images`)
      }

      // Save recent data using updateOrCreate
      await this.saveRecentImages(recentImages)

      logger.info(`Light ESA update completed: ${recentImages.length} new items`)
    } finally {
      await this.closeBrowser()
    }
  }

  private async initBrowser(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    })
  }

  private async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Scrape all images from a telescope
   */
  private async scrapeAllTelescopeImages(config: ESAScrapingConfig): Promise<ScrapedImageData[]> {
    const fullImageDataList: ScrapedImageData[] = []
    const page = await this.browser!.newPage()

    try {
      const totalPages = await this.getTotalPages(page, config)
      logger.info(`Total pages to scrape for ${config.type}: ${totalPages}`)

      for (let i = 1; i <= totalPages; i++) {
        logger.info(`Scraping page ${i}/${totalPages} for ${config.type}`)
        await page.goto(config.baseUrl + 'page/' + i + config.parameters)
        const imageDataList = await this.scrapePage(page, config)
        fullImageDataList.push(...imageDataList)
      }
    } finally {
      await page.close()
    }

    return fullImageDataList
  }

  /**
   * Scrape recent images (last 3 pages) from a telescope
   */
  private async scrapeRecentTelescopeImages(
    config: ESAScrapingConfig
  ): Promise<ScrapedImageData[]> {
    const recentImageDataList: ScrapedImageData[] = []
    const page = await this.browser!.newPage()

    try {
      const totalPages = await this.getTotalPages(page, config)
      const recentPages = Math.min(3, totalPages) // Last 3 pages

      logger.info(`Checking recent ${recentPages} pages for ${config.type}`)

      for (let i = Math.max(1, totalPages - recentPages + 1); i <= totalPages; i++) {
        logger.info(`Scraping recent page ${i}/${totalPages} for ${config.type}`)
        await page.goto(config.baseUrl + 'page/' + i + config.parameters)
        const imageDataList = await this.scrapePage(page, config)
        recentImageDataList.push(...imageDataList)

        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    } finally {
      await page.close()
    }

    return recentImageDataList
  }

  /**
   * Get the total number of pages to scrape
   */
  private async getTotalPages(page: Page, config: ESAScrapingConfig): Promise<number> {
    try {
      await page.goto(config.baseUrl + 'page/1' + config.parameters)
      await page.waitForSelector(config.totalPagesSelector, { timeout: 10000 })

      const totalPages = await this.extractText(page, config.totalPagesSelector)
      return totalPages ? Number.parseInt(totalPages) : 0
    } catch (error) {
      logger.error(`Error getting total pages for ${config.type}`, error)
      return 0
    }
  }

  /**
   * Scrape a single page
   */
  private async scrapePage(page: Page, config: ESAScrapingConfig): Promise<ScrapedImageData[]> {
    const listLength = await page.evaluate((sel: string) => {
      // @ts-ignore - document is available in browser context
      return document.getElementsByClassName(sel).length
    }, config.imageLengthSelector)

    logger.info(`Found ${listLength} images on page for ${config.type}`)

    const imageDataList: ScrapedImageData[] = []

    for (let i = 1; i <= listLength; i++) {
      try {
        const { imageUrl, title } = await this.getImageData(page, i, config)
        if (!imageUrl || !title) continue

        const imageDetails = await this.getImageDetails(
          page,
          `https://${config.domain}.org${imageUrl}`,
          config
        )
        if (!imageDetails || !Object.values(imageDetails).every((value) => value !== undefined))
          continue

        console.log(`Image details: ${JSON.stringify(imageDetails)}`)

        await this.batchSaveImages([
          {
            esaId: imageDetails.id,
            imgHash: ImageUrlService.generateImageHash(imageDetails.fullUrl || imageUrl),
            title: title,
            credits: imageDetails.credits,
            constellation: imageDetails.constellation,
            fov: imageDetails.fov,
            releaseDate: imageDetails.releaseDate,
            type: config.type,
          },
        ])
      } catch (error) {
        logger.error(`Error processing image ${i} on page for ${config.type}`, error)
        continue
      }
    }

    return imageDataList
  }

  /**
   * Get image data from a page
   */
  private async getImageData(
    page: Page,
    index: number,
    config: ESAScrapingConfig
  ): Promise<{ imageUrl: string; title: string }> {
    const imageUrlSelector = config.imageSelector.replace('INDEX', index.toString())
    const titleSelector = config.imageTitleSelector.replace('INDEX', index.toString())

    const imageUrl = await this.extractAttribute(page, imageUrlSelector, 'href')
    const title = await this.extractText(page, titleSelector)

    return { imageUrl: imageUrl ?? '', title: title ?? '' }
  }

  /**
   * Get image details from a page
   */
  private async getImageDetails(
    page: Page,
    url: string,
    config: ESAScrapingConfig
  ): Promise<{
    fullUrl: string
    id: string
    credits: string
    constellation: string
    fov: string
    releaseDate: string
  } | null> {
    await page.goto(url, { waitUntil: 'networkidle0' })

    const fullUrl = await this.extractAttribute(page, config.imageFullSizeSelector, 'href')
    const id = await this.extractText(page, config.imageEsaIdSelector)
    const credits = await this.extractText(page, config.creditsSelector)
    const fov = await this.extractText(page, config.fovSelector)
    const releaseDate = await this.extractText(page, config.releaseDateSelector)
    const constellation = await this.extractConstellation(page)

    await page.goBack()

    return {
      fullUrl: fullUrl ?? '',
      id: id ?? '',
      credits: credits ?? '',
      constellation: constellation ?? '',
      fov: fov ?? '',
      releaseDate: releaseDate ?? '',
    }
  }

  /**
   * Extract constellation name by finding the th element with "Constellation: " text
   * and getting the text from the <a> tag in the corresponding td
   */
  private async extractConstellation(page: Page): Promise<string | null> {
    try {
      return await page.evaluate(() => {
        // @ts-ignore - document is available in browser context
        // Find the table with aria-describedby="About the Object"
        const table = document.querySelector('[aria-describedby="About the Object"]')
        if (!table) return null

        // Find all th elements in the table
        // @ts-ignore - querySelectorAll is available in browser context
        const thElements = table.querySelectorAll('th')

        // Find the th element containing "Constellation:"
        // @ts-ignore - Element is available in browser context
        let constellationTh: Element | null = null
        for (const th of thElements) {
          // @ts-ignore - textContent is available in browser context
          const text = th.textContent?.trim() || ''
          if (text.includes('Constellation:')) {
            constellationTh = th
            break
          }
        }

        if (!constellationTh) return null

        // Get the parent tr element
        // @ts-ignore - closest is available in browser context
        const tr = constellationTh.closest('tr')
        if (!tr) return null

        // Find the td element in the same row
        // @ts-ignore - querySelector is available in browser context
        const td = tr.querySelector('td')
        if (!td) return null

        // Find the <a> tag inside the td and get its text
        // @ts-ignore - querySelector is available in browser context
        const link = td.querySelector('a')
        if (!link) return null

        // @ts-ignore - textContent is available in browser context
        return link.textContent?.trim() || null
      })
    } catch (error) {
      logger.error('Error extracting constellation', error)
      return null
    }
  }

  /**
   * Helper to extract text from an element
   */
  private async extractText(page: Page, selector: string): Promise<string | null> {
    try {
      return await page.evaluate((sel) => {
        // @ts-ignore - document is available in browser context
        const element = document.querySelector(sel)
        return element ? element.textContent?.trim() : null
      }, selector)
    } catch (error) {
      return null
    }
  }

  /**
   * Helper to extract attribute from an element
   */
  private async extractAttribute(
    page: Page,
    selector: string,
    attribute: string
  ): Promise<string | null> {
    try {
      return await page.evaluate(
        (sel, attr) => {
          // @ts-ignore - document is available in browser context
          const element = document.querySelector(sel)
          return element ? element.getAttribute(attr) : null
        },
        selector,
        attribute
      )
    } catch (error) {
      return null
    }
  }

  /**
   * Find constellation by name and return its ID
   */
  private async findConstellationId(constellationName: string | undefined): Promise<number | null> {
    if (!constellationName) return null

    try {
      // Query database directly to get the id field since the model uses 'code' as primary key
      // but the database table has 'id' as the actual primary key
      const db = await import('@adonisjs/lucid/services/db')
      const constellationRecord = await db.default
        .from('constellations')
        .where('full_name', 'ILIKE', `%${constellationName.trim()}%`)
        .select('id')
        .first()

      if (!constellationRecord || !constellationRecord.id) {
        logger.warn(`Constellation not found: ${constellationName}`)
        return null
      }

      return constellationRecord.id as number
    } catch (error) {
      logger.error(`Error finding constellation: ${constellationName}`, error)
      return null
    }
  }

  /**
   * Find space telescope by code (JWST, HUBBLE) and return its ID
   */
  private async findSpaceTelescopeId(
    telescopeType: 'JWST' | 'HUBBLE' | 'OTHER'
  ): Promise<number | null> {
    try {
      const telescope = await SpaceTelescope.findBy('code', telescopeType)

      if (!telescope) {
        logger.warn(`Space telescope not found: ${telescopeType}`)
        return null
      }

      return telescope.id
    } catch (error) {
      logger.error(`Error finding space telescope: ${telescopeType}`, error)
      return null
    }
  }

  /**
   * Batch save images to database
   */
  private async batchSaveImages(data: ScrapedImageData[]): Promise<void> {
    if (data.length === 0) return

    logger.info(`Saving ${data.length} images to database...`)

    for (const imageData of data) {
      let constellationId: number | null = null
      let spaceTelescopeId: number | null = null

      try {
        // Reconstruct image URLs
        const imgSrc = ImageUrlService.reconstructEsaImageUrl(
          imageData.esaId,
          imageData.type,
          false
        )
        const imgFullSize = ImageUrlService.reconstructEsaImageUrl(
          imageData.esaId,
          imageData.type,
          true
        )

        // Find constellation ID
        constellationId = await this.findConstellationId(imageData.constellation)
        if (!constellationId) {
          logger.warn(
            `Skipping image ${imageData.esaId} - constellation not found: ${imageData.constellation || 'unknown'}`
          )
          continue
        }

        // Find space telescope ID
        spaceTelescopeId = await this.findSpaceTelescopeId(imageData.type)
        if (!spaceTelescopeId) {
          logger.warn(
            `Skipping image ${imageData.esaId} - space telescope not found: ${imageData.type}`
          )
          continue
        }

        // Map to new model structure
        const imagePayload: Partial<SpaceTelescopeImage> = {
          esa_id: imageData.esaId,
          img_src: imgSrc,
          img_full_size: imgFullSize,
          title: imageData.title,
          credits: imageData.credits || '',
          fov: imageData.fov || '',
          release_date: imageData.releaseDate || '',
          type: imageData.type, // Keep for backward compatibility
          constellation_id: constellationId,
          space_telescope_id: spaceTelescopeId,
        }

        await ESASpaceTelescopeImage.create(imagePayload)
      } catch (error: any) {
        console.log(error)
        // Skip duplicates (esa_id is unique)
        if (error.code === '23505') {
          // PostgreSQL unique constraint violation - duplicate entry
          logger.debug(`Skipping duplicate image: ${imageData.esaId}`)
        } else {
          // Log detailed error information
          logger.error(`Error saving image ${imageData.esaId}`, {
            error: error.message || error,
            errorCode: error.code,
            errorDetail: error.detail,
            errorConstraint: error.constraint,
            errorTable: error.table,
            payload: {
              esa_id: imageData.esaId,
              title: imageData.title,
              type: imageData.type,
              constellation_id: constellationId,
              space_telescope_id: spaceTelescopeId,
            },
            stack: error.stack,
          })
        }
      }
    }

    logger.info(`Successfully saved ${data.length} ESA images`)
  }

  /**
   * Save recent images using updateOrCreate
   */
  private async saveRecentImages(data: ScrapedImageData[]): Promise<void> {
    if (data.length === 0) return

    logger.info(`Processing ${data.length} recent images...`)

    for (const imageData of data) {
      let constellationId: number | null = null
      let spaceTelescopeId: number | null = null

      try {
        // Reconstruct image URLs
        const imgSrc = ImageUrlService.reconstructEsaImageUrl(
          imageData.esaId,
          imageData.type,
          false
        )
        const imgFullSize = ImageUrlService.reconstructEsaImageUrl(
          imageData.esaId,
          imageData.type,
          true
        )

        // Find constellation ID
        constellationId = await this.findConstellationId(imageData.constellation)
        if (!constellationId) {
          logger.warn(
            `Skipping image ${imageData.esaId} - constellation not found: ${imageData.constellation || 'unknown'}`
          )
          continue
        }

        // Find space telescope ID
        spaceTelescopeId = await this.findSpaceTelescopeId(imageData.type)
        if (!spaceTelescopeId) {
          logger.warn(
            `Skipping image ${imageData.esaId} - space telescope not found: ${imageData.type}`
          )
          continue
        }

        // Map to new model structure
        const imagePayload: Partial<ESASpaceTelescopeImage> = {
          esa_id: imageData.esaId,
          img_src: imgSrc,
          img_full_size: imgFullSize,
          title: imageData.title,
          credits: imageData.credits || '',
          fov: imageData.fov || '',
          release_date: imageData.releaseDate || '',
          type: imageData.type, // Keep for backward compatibility
          constellation_id: constellationId,
          space_telescope_id: spaceTelescopeId,
        }

        await ESASpaceTelescopeImage.updateOrCreate({ esa_id: imageData.esaId }, imagePayload)
      } catch (error: any) {
        // Skip duplicates (esa_id is unique)
        if (error.code === '23505') {
          // PostgreSQL unique constraint violation - duplicate entry
          logger.debug(`Skipping duplicate image: ${imageData.esaId}`)
        } else {
          // Log detailed error information
          logger.error(`Error updating image ${imageData.esaId}`, {
            error: error.message || error,
            errorCode: error.code,
            errorDetail: error.detail,
            errorConstraint: error.constraint,
            errorTable: error.table,
            payload: {
              esa_id: imageData.esaId,
              title: imageData.title,
              type: imageData.type,
              constellation_id: constellationId,
              space_telescope_id: spaceTelescopeId,
            },
            stack: error.stack,
          })
        }
      }
    }

    logger.info(`Successfully processed ${data.length} recent ESA images`)
  }
}
