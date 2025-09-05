import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'
import NasaRoverScrapingService from '#services/nasa_rover_scraping_service'

export default class NasaRoverScrapingController {
  @inject()
  public async startScraping({ request, response }: HttpContext) {
    try {
      const rover = String(request.input('rover'))
      const beginSol = Number(request.input('begin_sol'))
      const endSol = Number(request.input('end_sol'))
      const camera = request.input('camera') ? String(request.input('camera')) : undefined

      if (!rover || Number.isNaN(beginSol) || Number.isNaN(endSol)) {
        return response.badRequest({
          success: false,
          message: 'Missing required params: rover, begin_sol, end_sol',
        })
      }

      const apiKey = env.get('NASA_API_KEY')
      const service = new NasaRoverScrapingService()

      // Non-blocking background task
      service
        .scrapeRange({ rover, beginSol, endSol, camera, apiKey })
        .then((stats) => {
          logger.info('NASA rover scraping completed: %o', stats)
        })
        .catch((e) => logger.error('NASA rover scraping failed: %o', e))

      return response.json({
        success: true,
        status: 'running',
        rover,
        beginSol,
        endSol,
        camera: camera || null,
      })
    } catch (error) {
      logger.error(error)
      return response.status(500).json({ success: false, message: 'Failed to start scraping' })
    }
  }
}


