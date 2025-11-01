import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import NasaRssApiService from '#services/nasa-rss-api.service'
import logger from '@adonisjs/core/services/logger'

export default class NasaRssApiController {
  /**
   * Start extracting and storing all images from NASA RSS feed
   * This is a non-blocking background task
   */
  @inject()
  async startExtraction({ response }: HttpContext) {
    try {
      const service = new NasaRssApiService()

      // Start extraction in background (non-blocking)
      service
        .extractAndStoreAllImages()
        .then((stats) => {
          logger.info('NASA RSS feed extraction completed: %o', stats)
        })
        .catch((error) => {
          logger.error('NASA RSS feed extraction failed: %o', error)
        })

      logger.info('NASA RSS feed extraction task started')

      return response.json({
        success: true,
        message: 'NASA RSS feed extraction started successfully',
        status: 'running',
        taskType: 'extraction',
      })
    } catch (error) {
      logger.error('Failed to start NASA RSS feed extraction', error)

      return response.status(500).json({
        success: false,
        message: 'Failed to start NASA RSS feed extraction',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get a single page from the RSS feed (for testing/debugging)
   */
  @inject()
  async getFeedPage({ request, response }: HttpContext) {
    try {
      const page = Number(request.input('page', 1))
      const service = new NasaRssApiService()

      const feedData = await service.getRssFeed()
      if (!feedData) {
        return response.status(404).json({
          success: false,
          message: 'Failed to fetch RSS feed',
        })
      }

      return response.json({
        success: true,
        data: feedData,
      })
    } catch (error) {
      logger.error('Failed to get RSS feed page', error)

      return response.status(500).json({
        success: false,
        message: 'Failed to get RSS feed page',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get extraction status and statistics
   */
  @inject()
  async getExtractionStats({ response }: HttpContext) {
    try {
      // Import models for statistics
      const { default: RoverImage } = await import('#models/rover-image')

      const totalImages = await RoverImage.query().count('* as count')
      const latestImages = await RoverImage.query()
        .orderBy('id', 'desc')
        .limit(10)
        .preload('camera')
        .preload('rover')

      return response.json({
        success: true,
        stats: {
          totalImages: totalImages[0].$extras.count,
          latestImages: latestImages.map((img) => ({
            id: img.id,
            sol: img.sol,
            rover: img.rover?.name || null,
            camera: img.camera?.full_name || null,
            title: img.title,
            imgSrc: img.img_src,
            thumbnailUrl: img.thumbnail_url,
          })),
        },
        endpoints: {
          startExtraction: '/api/v1/nasa/rss/start-extraction',
          getFeedPage: '/api/v1/nasa/rss/feed-page',
          getStats: '/api/v1/nasa/rss/stats',
        },
      })
    } catch (error) {
      logger.error('Failed to get extraction statistics', error)

      return response.status(500).json({
        success: false,
        message: 'Failed to get extraction statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
