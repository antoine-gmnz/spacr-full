import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import OptimizedImageService from '#services/optimized_image_service'
import {
  esaImageSearchValidator,
  optimizedImageValidator,
} from '#validators/optimized_image_validators'
import logger from '@adonisjs/core/services/logger'

export default class OptimizedImagesController {
  @inject()
  async getRoverImages({ request, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const { page, limit, roverId, cameraCode, begin_sol, end_sol } =
        await optimizedImageValidator.validate(request.all())

      const result = await imageService.getRoverImages(page, limit, {
        roverId,
        cameraCode,
        begin_sol,
        end_sol,
      })

      return response.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error(error)
      return response.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        error: error.message,
      })
    }
  }

  @inject()
  async getRoverImage({ params, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const image = await imageService.getRoverImage(params.id)

      return response.json({
        success: true,
        data: image,
      })
    } catch (error) {
      logger.error(error)
      return response.status(404).json({
        success: false,
        message: 'Rover image not found',
        error: error.message,
      })
    }
  }

  @inject()
  async getEsaImage({ params, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const image = await imageService.getEsaImage(params.id)

      return response.json({
        success: true,
        data: image,
      })
    } catch (error) {
      logger.error(error)
      return response.status(404).json({
        success: false,
        message: 'ESA image not found',
        error: error.message,
      })
    }
  }

  @inject()
  async searchRoverImages({ request, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      logger.error(request.all())
      console.log('coucou')
      const { rover, camera, begin_sol, end_sol, page, limit } = request.all()

      console.log('coucou 2')
      const result = await imageService.searchRoverImages(2, 'NAVCAM', 1, 10, 1, 10)

      return response.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error(error)
      return response.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        error: error.message,
      })
    }
  }

  @inject()
  async searchEsaImages({ request, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const { search, page, limit } = await esaImageSearchValidator.validate(request.all())

      const result = await imageService.searchEsaImages(search, page, limit)

      return response.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error(error)
      return response.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        error: error.message,
      })
    }
  }

  @inject()
  async getStats({ response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const stats = await imageService.getImageStats()

      return response.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      logger.error(error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message,
      })
    }
  }

  @inject()
  async getCameras({ response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const cameras = await imageService.getCameras()

      return response.json({
        success: true,
        data: cameras,
      })
    } catch (error) {
      logger.error(error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get cameras',
        error: error.message,
      })
    }
  }

  @inject()
  async getConstellations({ response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const constellations = await imageService.getConstellations()

      return response.json({
        success: true,
        data: constellations,
      })
    } catch (error) {
      logger.error(error)
      return response.status(500).json({
        success: false,
        message: 'Failed to get constellations',
        error: error.message,
      })
    }
  }
}
