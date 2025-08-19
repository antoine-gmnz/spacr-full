import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ESAScrapingService from '#services/esa_scraping_service'
import logger from '@adonisjs/core/services/logger'

export default class ESAScrapingController {
  /**
   * Trigger initial heavy ESA scraping task
   */
  @inject()
  async startInitialScraping({ response }: HttpContext) {
    try {
      const scrapingService = new ESAScrapingService()
      
      // Start scraping in background (non-blocking)
      scrapingService.performInitialHeavyScraping().catch(error => {
        logger.error('Initial ESA scraping failed', error)
      })
      
      logger.info('Initial ESA scraping task started')
      
      return response.json({
        success: true,
        message: 'Heavy ESA scraping task started successfully',
        status: 'running',
        taskType: 'initial'
      })
      
    } catch (error) {
      logger.error('Failed to start initial ESA scraping', error)
      
      return response.status(500).json({
        success: false,
        message: 'Failed to start ESA scraping task',
        error: error.message
      })
    }
  }

  /**
   * Trigger immediate light ESA update
   */
  @inject()
  async triggerUpdate({ response }: HttpContext) {
    try {
      const scrapingService = new ESAScrapingService()
      
      // Start light update in background (non-blocking)
      scrapingService.performLightUpdate().catch(error => {
        logger.error('ESA light update failed', error)
      })
      
      logger.info('ESA light update task started')
      
      return response.json({
        success: true,
        message: 'ESA light update task started successfully',
        status: 'running',
        taskType: 'update'
      })
      
    } catch (error) {
      logger.error('Failed to start ESA light update', error)
      
      return response.status(500).json({
        success: false,
        message: 'Failed to start ESA update task',
        error: error.message
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
          triggerUpdate: '/api/v1/esa-scraping/trigger-update'
        }
      })
      
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get scraping status',
        error: error.message
      })
    }
  }

  /**
   * Get scraping statistics
   */
  @inject()
  async getScrapingStats({ response }: HttpContext) {
    try {
      // Import models for statistics
      const { default: OptimizedEsaImage } = await import('#models/optimized_esa_image')
      
      const totalImages = await OptimizedEsaImage.query().count('* as count')
      const jwstImages = await OptimizedEsaImage.query().where('type', 'JWST').count('* as count')
      const hubbleImages = await OptimizedEsaImage.query().where('type', 'HUBBLE').count('* as count')
      
      const latestImages = await OptimizedEsaImage.query()
        .orderBy('createdAt', 'desc')
        .limit(5)
        .preload('constellation')
      
      return response.json({
        success: true,
        stats: {
          totalImages: totalImages,
          jwstImages: jwstImages[0].$extras.count,
          hubbleImages: hubbleImages[0].$extras.count,
          latestImages: latestImages.map(img => ({
            id: img.id,
            esaId: img.esaId,
            title: img.titleShort,
            type: img.type,
            constellation: img.constellation?.fullName || null,
            createdAt: img.createdAt.toISO()
          }))
        }
      })
      
    } catch (error) {
      logger.error('Failed to get scraping statistics', error)
      
      return response.status(500).json({
        success: false,
        message: 'Failed to get scraping statistics',
        error: error.message
      })
    }
  }
}
