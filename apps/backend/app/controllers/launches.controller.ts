import logger from '@adonisjs/core/services/logger'
import LaunchesService, { type LaunchSearchParams } from '#services/launches.service'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

export default class LaunchesController {
  @inject()
  async getLaunches({ response }: HttpContext, launchesService: LaunchesService) {
    try {
      const launches = await launchesService.getLaunches()
      return response.json(launches)
    } catch (error) {
      logger.error('Failed to get launches: %o', error)
      return response.status(500).json({ message: 'Failed to get launches' })
    }
  }

  @inject()
  async getUpcomingLaunches({ request, response }: HttpContext, launchesService: LaunchesService) {
    try {
      const limit = request.input('limit', 10)
      const launches = await launchesService.getUpcomingLaunches(limit)
      console.log(launches)
      return response.json(launches)
    } catch (error) {
      logger.error('Failed to get upcoming launches: %o', error)
      return response.status(500).json({ message: 'Failed to get upcoming launches' })
    }
  }

  @inject()
  async searchLaunches({ request, response }: HttpContext, launchesService: LaunchesService) {
    try {
      const searchParams: LaunchSearchParams = {
        search: request.input('search'),
        limit: request.input('limit', 20),
        offset: request.input('offset', 0),
        year: request.input('year'),
      }

      const launches = await launchesService.searchLaunches(searchParams)
      return response.json(launches)
    } catch (error) {
      logger.error('Failed to search launches: %o', error)
      return response.status(500).json({ message: 'Failed to search launches' })
    }
  }
}
