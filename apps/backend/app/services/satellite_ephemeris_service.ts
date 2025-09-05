import SatelliteModel from '#models/satellite'
import * as sat from 'satellite.js'

export interface SatellitePosition {
  id: number
  name: string
  // ECI coordinates (km)
  x: number
  y: number
  z: number
  // LLA for tooltip/debug
  lat: number
  lon: number
  altKm: number
  noradId: number | null
  type: string | null
}

export default class SatelliteEphemerisService {
  /**
   * Compute ECI position for satellites with TLE (at given date).
   * Filters: only active satellites unless includeInactive = true
   */
  async getEarthSatellitesPositions(date: Date = new Date(), includeInactive = false): Promise<SatellitePosition[]> {
    const q = SatelliteModel.query()
    if (!includeInactive) q.where('status', 'active')
    const sats = await q.whereNotNull('tleLine1').whereNotNull('tleLine2')

    const gmst = sat.gstime(date)
    const positions: SatellitePosition[] = []

    for (const s of sats) {
      if (!s.tleLine1 || !s.tleLine2) continue
      try {
        const rec = sat.twoline2satrec(s.tleLine1, s.tleLine2)
        const pv = sat.propagate(rec, date)
        if (!pv.position) continue
        const eci = pv.position
        const geo = sat.eciToGeodetic(eci, gmst)
        positions.push({
          id: s.id,
          name: s.name,
          x: eci.x,
          y: eci.y,
          z: eci.z,
          lat: sat.degreesLat(geo.latitude),
          lon: sat.degreesLong(geo.longitude),
          altKm: geo.height,
          noradId: s.noradId,
          type: s.type,
        })
      } catch (_) {
        // skip invalid TLEs
      }
    }

    return positions
  }
}
