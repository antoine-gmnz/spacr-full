import type { HttpContext } from '@adonisjs/core/http'
import ISSService from '#services/iss.service'

export default class ISSController {
  private issService: ISSService

  constructor() {
    this.issService = new ISSService()
  }

  /**
   * Get current ISS position
   * GET /api/v1/iss/position
   */
  public async getPosition({ response }: HttpContext) {
    try {
      const position = await this.issService.getPosition()
      return response.json(position)
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch ISS position',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get current ISS crew members
   * GET /api/v1/iss/crew
   */
  public async getCrew({ response }: HttpContext) {
    try {
      const crew = await this.issService.getCrew()
      return response.json({ crew })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to fetch ISS crew',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Get upcoming ISS passes for a location
   * GET /api/v1/iss/passes?lat=XX&lng=YY&alt=ZZ&days=10
   */
  public async getPasses({ request, response }: HttpContext) {
    try {
      const lat = request.input('lat')
      const lng = request.input('lng')
      const alt = request.input('alt', 0)
      const days = request.input('days', 10)

      if (lat === undefined || lng === undefined) {
        return response.status(400).json({
          error: 'Missing required parameters',
          message: 'Both lat and lng query parameters are required',
        })
      }

      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      const altitude = parseFloat(alt)
      const daysNum = parseInt(days, 10)

      if (isNaN(latitude) || isNaN(longitude)) {
        return response.status(400).json({
          error: 'Invalid parameters',
          message: 'lat and lng must be valid numbers',
        })
      }

      if (isNaN(altitude)) {
        return response.status(400).json({
          error: 'Invalid altitude',
          message: 'alt must be a valid number',
        })
      }

      if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
        return response.status(400).json({
          error: 'Invalid days',
          message: 'days must be a number between 1 and 30',
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

      const passes = await this.issService.getPasses(latitude, longitude, altitude, daysNum)
      return response.json({ passes })
    } catch (error) {
      return response.status(500).json({
        error: 'Failed to calculate ISS passes',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

