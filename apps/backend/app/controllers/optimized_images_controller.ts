import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import OptimizedImageService from '#services/optimized_image_service'
import DataOptimizationService from '#services/data_optimization_service'
import { esaImageSearchValidator, optimizedImageValidator, roverImageSearchValidator } from '#validators/optimized_image_validators'
import logger from '@adonisjs/core/services/logger'

export default class OptimizedImagesController {
  @inject()
  async getRoverImages({ request, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const { page, limit, roverId, cameraCode, begin_sol, end_sol } = await optimizedImageValidator.validate(request.all())

      const result = await imageService.getRoverImages(page, limit, {
        roverId,
        cameraCode,
        begin_sol,
        end_sol
      })

      return response.json({
        success: true,
        data: result
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Invalid request parameters',
        error: error.message
      })
    }
  }
  
  @inject()
  async getRoverImage({ params, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const image = await imageService.getRoverImage(params.id)

      return response.json({
        success: true,
        data: image
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Rover image not found',
        error: error.message
      })
    }
  }

  @inject()
  async getEsaImage({ params, response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const image = await imageService.getEsaImage(params.id)

      return response.json({
        success: true,
        data: image
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'ESA image not found',
        error: error.message
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
      const result = await imageService.searchRoverImages(2, "NAVCAM", 1, 10, 1, 10)

      return response.json({
        success: true,
        data: result
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        error: error.message
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
        data: result
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Invalid search parameters',
        error: error.message
      })
    }
  }

  @inject()
  async getStats({ response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const stats = await imageService.getImageStats()

      return response.json({
        success: true,
        data: stats
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message
      })
    }
  }

  @inject()
  async getCameras({ response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const cameras = await imageService.getCameras()

      return response.json({
        success: true,
        data: cameras
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get cameras',
        error: error.message
      })
    }
  }

  @inject()
  async getConstellations({ response }: HttpContext, imageService: OptimizedImageService) {
    try {
      const constellations = await imageService.getConstellations()

      return response.json({
        success: true,
        data: constellations
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get constellations',
        error: error.message
      })
    }
  }

  // Migration and optimization endpoints
  @inject()
  async migrateData({ response }: HttpContext) {
    try {
      // Seed lookup tables first
      await DataOptimizationService.seedLookupTables()
      
      // Migrate data
      await DataOptimizationService.migrateRoverImages()
      await DataOptimizationService.migrateEsaImages()

      return response.json({
        success: true,
        message: 'Data migration completed successfully'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Data migration failed',
        error: error.message
      })
    }
  }

  @inject()
  async getStorageSavings({ response }: HttpContext) {
    try {
      const savings = await DataOptimizationService.calculateStorageSavings()

      return response.json({
        success: true,
        data: {
          ...savings,
          oldSizeFormatted: this.formatBytes(savings.oldSize),
          newSizeFormatted: this.formatBytes(savings.newSize),
          savingsFormatted: this.formatBytes(savings.savings)
        }
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to calculate storage savings',
        error: error.message
      })
    }
  }

  @inject()
  async validateDataIntegrity({ response }: HttpContext) {
    try {
      const validation = await DataOptimizationService.validateDataIntegrity()

      return response.json({
        success: true,
        data: validation
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Data integrity validation failed',
        error: error.message
      })
    }
  }

  // Helper method to format bytes
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
