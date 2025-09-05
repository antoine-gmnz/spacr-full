import RoverService from '#services/rover.service';
import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http'

export default class RoverController {
  @inject()
  async getRovers({ response }: HttpContext, roverService: RoverService) {
    const rovers = await roverService.getRovers()
    return response.json(rovers)
  }
}