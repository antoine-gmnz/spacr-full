import type { PlanetPosition } from '#services/ephemeris_service'

// Bodies supported in MVP
export type BodyName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune'

// Single object position payload for frontend
export interface ObjectPositionDTO {
  body: BodyName
  timestamp: string
  equatorial: {
    raDeg: number
    decDeg: number
    distanceAu: number
  }
  observables: {
    phase: number
    magnitude?: number
    angularDiameterArcsec: number
    elongationDeg: number
  }
  vectorAu: {
    x: number
    y: number
    z: number
  }
}

// Response wrapper for positions endpoint
export interface PositionsResponseDTO {
  date: string
  positions: ObjectPositionDTO[]
}

// Mapper from service model to DTO
export function mapPlanetPositionToDTO(p: PlanetPosition): ObjectPositionDTO {
  return {
    body: p.body as BodyName,
    timestamp: p.timestamp,
    equatorial: {
      raDeg: p.ra,
      decDeg: p.dec,
      distanceAu: p.distanceAu,
    },
    observables: {
      phase: p.phase,
      magnitude: p.magnitude,
      angularDiameterArcsec: p.angularDiameterArcsec,
      elongationDeg: p.elongationDeg,
    },
    vectorAu: {
      x: p.x,
      y: p.y,
      z: p.z,
    },
  }
}
