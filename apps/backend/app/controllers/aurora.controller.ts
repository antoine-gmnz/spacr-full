import type { HttpContext } from '@adonisjs/core/http'
import AuroraService from '#services/aurora.service'

export default class AuroraController {
  private auroraService: AuroraService

  constructor() {
    this.auroraService = new AuroraService()
  }

  /**
   * Get current aurora forecast data
   * GET /api/v1/aurora
   */
  public async getAuroraData({ response }: HttpContext) {
    try {
      const data = await this.auroraService.getAuroraData()
      return response.json(data)
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch aurora data',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Check aurora visibility for a specific location
   * GET /api/v1/aurora/visibility?lat=XX&lng=YY
   */
  public async getVisibility({ request, response }: HttpContext) {
    try {
      const lat = request.input('lat')
      const lng = request.input('lng')

      if (lat === undefined || lng === undefined) {
        return response.status(400).json({
          error: 'Missing required parameters',
          message: 'Both lat and lng query parameters are required',
        })
      }

      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)

      if (isNaN(latitude) || isNaN(longitude)) {
        return response.status(400).json({
          error: 'Invalid parameters',
          message: 'lat and lng must be valid numbers',
        })
      }

      if (latitude < -90 || latitude > 90) {
        return response.status(400).json({
          error: 'Invalid latitude',
          message: 'Latitude must be between -90 and 90',
        })
      }

      if (longitude < -180 || longitude > 180) {
        return response.status(400).json({
          error: 'Invalid longitude',
          message: 'Longitude must be between -180 and 180',
        })
      }

      const visibility = await this.auroraService.getVisibility(latitude, longitude)
      return response.json(visibility)
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to check visibility',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

