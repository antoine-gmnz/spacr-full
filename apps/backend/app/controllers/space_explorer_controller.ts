import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import EphemerisService from '#services/ephemeris_service'
import { mapPlanetPositionToDTO, type PositionsResponseDTO } from '#dto/space_explorer'
import SatelliteEphemerisService from '#services/satellite_ephemeris_service'

export default class SpaceExplorerController {
  /**
   * GET /api/v1/space-explorer/positions
   * Goal: Return planetary ephemeris for default bodies at an optional timestamp.
   * Query params:
   * - date?: ISO date string (defaults to now)
   */
  @inject()
  async getPositions({ request, response }: HttpContext, ephemerisService: EphemerisService) {
    try {
      const dateParam = request.qs().date as string | undefined
      const date = dateParam ? new Date(dateParam) : new Date()

      // Basic date validation
      if (dateParam && isNaN(date.getTime())) {
        return response.status(400).json({ success: false, message: 'Invalid date format. Use ISO string.' })
      }

      const positions = await ephemerisService.getPlanetaryPositions(date)
      const dto: PositionsResponseDTO = {
        date: date.toISOString(),
        positions: positions.map(mapPlanetPositionToDTO),
      }

      return response.json({ success: true, data: dto })
    } catch (error: any) {
      return response.status(500).json({ success: false, message: 'Failed to compute ephemeris', error: error?.message || String(error) })
    }
  }

  /**
   * GET /api/v1/space-explorer/satellites
   * Returns Earth satellites ECI positions for a given date.
   * Query params: date?: ISO string, includeInactive?: boolean
   */
  @inject()
  async getSatellites({ request, response }: HttpContext) {
    try {
      const dateParam = request.qs().date as string | undefined
      const includeInactive = (request.qs().includeInactive as string | undefined) === 'true'
      const date = dateParam ? new Date(dateParam) : new Date()
      if (dateParam && isNaN(date.getTime())) {
        return response.status(400).json({ success: false, message: 'Invalid date format. Use ISO string.' })
      }
      const service = new SatelliteEphemerisService()
      const sats = await service.getEarthSatellitesPositions(date, includeInactive)
      return response.json({ success: true, date: date.toISOString(), data: sats })
    } catch (error: any) {
      return response.status(500).json({ success: false, message: 'Failed to compute satellites positions', error: error?.message || String(error) })
    }
  }
}
