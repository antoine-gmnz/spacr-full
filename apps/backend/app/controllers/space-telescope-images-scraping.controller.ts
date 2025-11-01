import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import SpaceTelescopeImagesScrappingService from '#services/space-telescope-images-scrapping.service'
import ESASpaceTelescopeImage from '#models/space-telescope-image'
import SpaceTelescope from '#models/space-telescope'
import logger from '@adonisjs/core/services/logger'

export default class SpaceTelescopeImagesScrappingController {
  /**
   * Trigger initial heavy space telescope images scraping task
   */
  @inject()
  async startInitialScraping({ response }: HttpContext) {
    try {
      const scrapingService = new SpaceTelescopeImagesScrappingService()

      // Start scraping in background (non-blocking)
      scrapingService.performInitialHeavyScraping().catch((error) => {
        logger.error('Initial space telescope images scraping failed', error)
      })

      logger.info('Initial space telescope images scraping task started')

      return response.json({
        success: true,
        message: 'Heavy space telescope images scraping task started successfully',
        status: 'running',
        taskType: 'initial',
      })
    } catch (error: any) {
      logger.error('Failed to start initial space telescope images scraping', error)

      return response.status(500).json({
        success: false,
        message: 'Failed to start space telescope images scraping task',
        error: error.message,
      })
    }
  }

  /**
   * Trigger immediate light space telescope images update
   */
  @inject()
  async triggerUpdate({ response }: HttpContext) {
    try {
      const scrapingService = new SpaceTelescopeImagesScrappingService()

      // Start light update in background (non-blocking)
      scrapingService.performLightUpdate().catch((error) => {
        logger.error('Space telescope images light update failed', error)
      })

      logger.info('Space telescope images light update task started')

      return response.json({
        success: true,
        message: 'Space telescope images light update task started successfully',
        status: 'running',
        taskType: 'update',
      })
    } catch (error: any) {
      logger.error('Failed to start space telescope images light update', error)

      return response.status(500).json({
        success: false,
        message: 'Failed to start space telescope images update task',
        error: error.message,
      })
    }
  }

  /**
   * Get scraping status (simplified without job tracking)
   */
  @inject()
  async getScrapingStatus({ response }: HttpContext) {
    try {
      return response.json({
        success: true,
        message: 'Scraping status endpoint - use /stats for detailed information',
        status: 'available',
        endpoints: {
          stats: '/api/v1/esa-scraping/stats',
          startInitial: '/api/v1/esa-scraping/start-initial',
          triggerUpdate: '/api/v1/esa-scraping/trigger-update',
        },
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get scraping status',
        error: error.message,
      })
    }
  }

  /**
   * Get scraping statistics
   */
  @inject()
  async getScrapingStats({ response }: HttpContext) {
    try {
      // Get total images count
      const totalImages = await ESASpaceTelescopeImage.query().count('* as count')

      // Get JWST telescope
      const jwstTelescope = await SpaceTelescope.findBy('code', 'JWST')
      const jwstImages = jwstTelescope
        ? await ESASpaceTelescopeImage.query()
            .where('space_telescope_id', jwstTelescope.id)
            .count('* as count')
        : { 0: { $extras: { count: 0 } } }

      // Get Hubble telescope
      const hubbleTelescope = await SpaceTelescope.findBy('code', 'HUBBLE')
      const hubbleImages = hubbleTelescope
        ? await ESASpaceTelescopeImage.query()
            .where('space_telescope_id', hubbleTelescope.id)
            .count('* as count')
        : { 0: { $extras: { count: 0 } } }

      // Get latest images with relationships
      const latestImages = await ESASpaceTelescopeImage.query()
        .orderBy('created_at', 'desc')
        .limit(5)
        .preload('constellation')
        .preload('spaceTelescope')

      return response.json({
        success: true,
        stats: {
          totalImages: totalImages[0].$extras.count,
          jwstImages: jwstImages[0]?.$extras.count || 0,
          hubbleImages: hubbleImages[0]?.$extras.count || 0,
          latestImages: latestImages.map((img) => ({
            id: img.id,
            esaId: img.esa_id,
            title: img.title,
            type: img.type,
            spaceTelescope: img.spaceTelescope
              ? {
                  id: img.spaceTelescope.id,
                  name: img.spaceTelescope.name,
                  fullName: img.spaceTelescope.fullName,
                  code: img.spaceTelescope.code,
                }
              : null,
            constellation: img.constellation?.fullName || null,
            createdAt: img.createdAt?.toISO() || null,
          })),
        },
      })
    } catch (error: any) {
      logger.error('Failed to get scraping statistics', error)

      return response.status(500).json({
        success: false,
        message: 'Failed to get scraping statistics',
        error: error.message,
      })
    }
  }
}
