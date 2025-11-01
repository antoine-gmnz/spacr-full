import logger from '@adonisjs/core/services/logger'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import RoverImageService from '#services/rover-images.service'
import { getRoverImagesValidator, paginateValidator } from '#validators/get_validators'

export default class RoverImagesController {
  @inject()
  public async getLatestRoverImages(
    { response }: HttpContext,
    roverImageService: RoverImageService
  ) {
    try {
      const latestRoverImages = await roverImageService.getImages(1, 16)
      return response.json(latestRoverImages)
    } catch (error) {
      logger.error(error)
      return response.status(500).json({ message: 'Failed to get latest rover images' })
    }
  }

  @inject()
  public async searchImages(ctx: HttpContext, roverImageService: RoverImageService) {
    const data = ctx.request.all()
    console.log(data)
    const { page, limit, rover, camera, begin_sol, end_sol } =
      await getRoverImagesValidator.validate(data)

    const roverImages = await roverImageService.searchImages(
      rover,
      camera,
      begin_sol,
      end_sol,
      page,
      limit
    )

    return ctx.response.json(roverImages)
  }

  @inject()
  public async getImages(ctx: HttpContext, roverImageService: RoverImageService) {
    const data = ctx.request.all()
    const { page, limit } = await paginateValidator.validate(data)

    const roverImages = await roverImageService.getImages(page, limit)

    return ctx.response.json(roverImages)
  }
}
