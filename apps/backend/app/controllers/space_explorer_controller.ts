import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import EphemerisService from '#services/ephemeris_service'
import { mapPlanetPositionToDTO, type PositionsResponseDTO } from '#dto/space_explorer'

export default class SpaceExplorerController {
  /**
   * GET /api/v1/space-explorer/positions
   * Goal: Return planetary ephemeris for default bodies at an optional timestamp.
   * Query params:
   * - date?: ISO date string (defaults to now)
   */
  @inject()
  async getPositions({ request, response }: HttpContext) {
    try {
      const dateParam = request.qs().date as string | undefined
      const date = dateParam ? new Date(dateParam) : new Date()

      // Basic date validation
      if (dateParam && isNaN(date.getTime())) {
        return response.status(400).json({ success: false, message: 'Invalid date format. Use ISO string.' })
      }

      const service = new EphemerisService()
      const positions = await service.getPlanetaryPositions(date)
      const dto: PositionsResponseDTO = {
        date: date.toISOString(),
        positions: positions.map(mapPlanetPositionToDTO),
      }

      return response.json({ success: true, data: dto })
    } catch (error: any) {
      return response.status(500).json({ success: false, message: 'Failed to compute ephemeris', error: error?.message || String(error) })
    }
  }
}
