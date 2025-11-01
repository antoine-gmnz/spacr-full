import logger from '@adonisjs/core/services/logger'
import RoverService from '#services/rover.service'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

export default class RoverController {
  @inject()
  async getRovers({ response }: HttpContext, roverService: RoverService) {
    try {
      const rovers = await roverService.getRovers()
      return response.json(rovers)
    } catch (error) {
      logger.error(error)
      return response.status(500).json({ message: 'Failed to get rovers' })
    }
  }
}
