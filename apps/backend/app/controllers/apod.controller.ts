import ApodService from '#services/apod.service'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class ApodController {
  @inject()
  async getApod(ctx: HttpContext, apodService: ApodService) {
    try {
      const apod = await apodService.getApod()
      return ctx.response.json(await apod.json())
    } catch (error) {
      logger.error('Failed to get APOD: %o', error)
      return ctx.response.status(500).json({ message: 'Failed to get APOD' })
    }
  }
}
