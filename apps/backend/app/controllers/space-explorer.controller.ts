import logger from '@adonisjs/core/services/logger'
import EphemerisService, { type BodyName, type PlanetPosition } from '#services/ephemeris.service'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

// Response DTOs
interface PositionsResponse {
  success: boolean
  data: {
    date: string
    positions: PlanetPosition[]
    nextEvent: {
      title: string
      description: string
      body: BodyName
    }
  }
}

interface BodyResponse {
  success: boolean
  data: PlanetPosition
}

const VALID_BODIES: BodyName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']

export default class SpaceExplorerController {
  @inject()
  async getPositions({ request, response }: HttpContext, ephemerisService: EphemerisService) {
    try {
      // Parse optional date parameter
      const dateParam = request.input('date')
      let date = new Date()

      if (dateParam) {
        const parsedDate = new Date(dateParam)
        if (isNaN(parsedDate.getTime())) {
          return response.status(400).json({
            success: false,
            error: 'Invalid date format. Use ISO 8601 format (e.g., 2025-01-15T12:00:00Z)',
          })
        }
        date = parsedDate
      }

      // Get all positions
      const positions = ephemerisService.getAllPositions(date)
      const nextEvent = ephemerisService.getNextEvent(date)

      const result: PositionsResponse = {
        success: true,
        data: {
          date: date.toISOString(),
          positions,
          nextEvent,
        },
      }

      return response.json(result)
    } catch (error) {
      logger.error('Failed to get positions: %o', error)
      return response.status(500).json({
        success: false,
        error: 'Failed to calculate planetary positions',
      })
    }
  }

  @inject()
  async getBody({ params, request, response }: HttpContext, ephemerisService: EphemerisService) {
    try {
      const bodyName = params.name as string

      // Validate body name
      if (!VALID_BODIES.includes(bodyName as BodyName)) {
        return response.status(400).json({
          success: false,
          error: `Invalid body name. Valid bodies: ${VALID_BODIES.join(', ')}`,
        })
      }

      // Parse optional date parameter
      const dateParam = request.input('date')
      let date = new Date()

      if (dateParam) {
        const parsedDate = new Date(dateParam)
        if (isNaN(parsedDate.getTime())) {
          return response.status(400).json({
            success: false,
            error: 'Invalid date format. Use ISO 8601 format (e.g., 2025-01-15T12:00:00Z)',
          })
        }
        date = parsedDate
      }

      // Get position for specific body
      const position = ephemerisService.getBodyPosition(bodyName as BodyName, date)

      const result: BodyResponse = {
        success: true,
        data: position,
      }

      return response.json(result)
    } catch (error) {
      logger.error('Failed to get body position: %o', error)
      return response.status(500).json({
        success: false,
        error: 'Failed to calculate body position',
      })
    }
  }
}

