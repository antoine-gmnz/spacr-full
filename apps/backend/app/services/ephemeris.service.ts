import {
  Body,
  GeoVector,
  Equator,
  Illumination,
  AngleFromSun,
  MakeTime,
  Observer,
  KM_PER_AU,
  type AstroTime,
  type Vector,
  type EquatorialCoordinates,
  type IlluminationInfo,
} from '#lib/astronomy'

// Bodies we support
export type BodyName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune'

// Physical radii in km for angular diameter calculation
const BODY_RADII_KM: Record<BodyName, number> = {
  Sun: 695700,
  Moon: 1737.4,
  Mercury: 2439.7,
  Venus: 6051.8,
  Earth: 6378.1,
  Mars: 3389.5,
  Jupiter: 71492,
  Saturn: 60268,
  Uranus: 25559,
  Neptune: 24764,
}

// Map BodyName to astronomy.ts Body enum
const BODY_MAP: Record<Exclude<BodyName, 'Earth'>, Body> = {
  Sun: Body.Sun,
  Moon: Body.Moon,
  Mercury: Body.Mercury,
  Venus: Body.Venus,
  Mars: Body.Mars,
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
}

// Planet descriptions
const BODY_DESCRIPTIONS: Record<BodyName, string> = {
  Sun: 'The star at the center of our Solar System, providing light and heat to all planets.',
  Moon: "Earth's only natural satellite, influencing tides and lighting our night sky.",
  Mercury: 'The smallest planet and closest to the Sun, with extreme temperature variations.',
  Venus: 'The hottest planet with a thick toxic atmosphere, often called Earth\'s "sister planet".',
  Earth: 'Our home planet, the only known place in the universe with life.',
  Mars: 'The Red Planet, a prime target for human exploration with evidence of ancient water.',
  Jupiter: 'The largest planet, a gas giant with the famous Great Red Spot storm.',
  Saturn: 'Known for its spectacular ring system, the second largest planet.',
  Uranus: 'An ice giant that rotates on its side, with a faint ring system.',
  Neptune: 'The windiest planet, a deep blue ice giant at the edge of our Solar System.',
}

// Orbital periods in Earth days (approximate)
const ORBITAL_PERIODS: Record<BodyName, number> = {
  Sun: 0, // N/A
  Moon: 27.3,
  Mercury: 88,
  Venus: 225,
  Earth: 365.25,
  Mars: 687,
  Jupiter: 4333,
  Saturn: 10759,
  Uranus: 30687,
  Neptune: 60190,
}

export interface PlanetPosition {
  body: BodyName
  timestamp: string
  // Equatorial coordinates
  ra: number // Right Ascension in degrees
  dec: number // Declination in degrees
  distanceAu: number // Distance from Earth in AU
  // Observables
  phase: number // Illumination phase (0-1)
  magnitude?: number // Apparent magnitude (not for Sun)
  angularDiameterArcsec: number // Angular diameter in arcseconds
  elongationDeg: number // Angle from Sun in degrees
  // 3D position for visualization (heliocentric, in AU)
  x: number
  y: number
  z: number
  // Additional info
  description: string
  orbitalPeriodDays: number
}

export default class EphemerisService {
  // Default observer at Earth's center (geocentric)
  private observer: Observer = new Observer(0, 0, 0)

  /**
   * Calculate angular diameter in arcseconds
   */
  private calculateAngularDiameter(bodyName: BodyName, distanceAu: number): number {
    const radiusKm = BODY_RADII_KM[bodyName]
    const distanceKm = distanceAu * KM_PER_AU
    // Angular diameter = 2 * arctan(radius / distance) in radians, convert to arcseconds
    const angularRadians = 2 * Math.atan(radiusKm / distanceKm)
    return angularRadians * (180 / Math.PI) * 3600 // Convert to arcseconds
  }

  /**
   * Get position for a single celestial body
   */
  public getBodyPosition(bodyName: BodyName, date: Date = new Date()): PlanetPosition {
    const time = MakeTime(date)

    if (bodyName === 'Earth') {
      // Earth is at origin in geocentric view, but we need heliocentric position
      // Get Sun's position and negate it
      const sunGeo = GeoVector(Body.Sun, time, true)
      return {
        body: 'Earth',
        timestamp: date.toISOString(),
        ra: 0,
        dec: 0,
        distanceAu: 0,
        phase: 1,
        magnitude: undefined,
        angularDiameterArcsec: 0,
        elongationDeg: 0,
        x: -sunGeo.x,
        y: -sunGeo.y,
        z: -sunGeo.z,
        description: BODY_DESCRIPTIONS.Earth,
        orbitalPeriodDays: ORBITAL_PERIODS.Earth,
      }
    }

    const body = BODY_MAP[bodyName]

    // Get geocentric position vector
    const geoVector: Vector = GeoVector(body, time, true)

    // Get equatorial coordinates
    const equatorial: EquatorialCoordinates = Equator(body, time, this.observer, true, true)

    // Get illumination info (phase, magnitude)
    const illum: IlluminationInfo = Illumination(body, time)

    // Get elongation from Sun
    let elongation = 0
    if (bodyName !== 'Sun') {
      elongation = AngleFromSun(body, time)
    }

    // Calculate angular diameter
    const angularDiameter = this.calculateAngularDiameter(bodyName, equatorial.dist)

    // For heliocentric position (3D scene), we need to convert
    // geoVector is Earth->body, we need Sun->body
    // Sun->body = Sun->Earth + Earth->body = -Earth->Sun + geoVector
    const sunGeo = GeoVector(Body.Sun, time, true)
    const helioX = geoVector.x - sunGeo.x
    const helioY = geoVector.y - sunGeo.y
    const helioZ = geoVector.z - sunGeo.z

    return {
      body: bodyName,
      timestamp: date.toISOString(),
      ra: equatorial.ra * 15, // Convert hours to degrees
      dec: equatorial.dec,
      distanceAu: equatorial.dist,
      phase: illum.phase_fraction,
      magnitude: bodyName === 'Sun' ? undefined : illum.mag,
      angularDiameterArcsec: angularDiameter,
      elongationDeg: elongation,
      x: helioX,
      y: helioY,
      z: helioZ,
      description: BODY_DESCRIPTIONS[bodyName],
      orbitalPeriodDays: ORBITAL_PERIODS[bodyName],
    }
  }

  /**
   * Get positions for all supported celestial bodies
   */
  public getAllPositions(date: Date = new Date()): PlanetPosition[] {
    const bodies: BodyName[] = ['Sun', 'Moon', 'Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']
    return bodies.map(body => this.getBodyPosition(body, date))
  }

  /**
   * Get the closest visible planet (best for observation)
   */
  public getClosestPlanet(date: Date = new Date()): PlanetPosition | null {
    const planets: BodyName[] = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
    const positions = planets.map(body => this.getBodyPosition(body, date))

    // Find planet with best visibility (combination of magnitude and elongation)
    // Higher elongation = better visibility, lower magnitude = brighter
    let best: PlanetPosition | null = null
    let bestScore = -Infinity

    for (const pos of positions) {
      if (pos.magnitude === undefined) continue
      // Score: prioritize elongation > 20° and bright magnitude
      const elongationScore = pos.elongationDeg > 20 ? 1 : pos.elongationDeg / 20
      const magScore = Math.max(0, 5 - pos.magnitude) / 5 // Normalize magnitude
      const score = elongationScore * magScore

      if (score > bestScore) {
        bestScore = score
        best = pos
      }
    }

    return best
  }

  /**
   * Get upcoming planetary event description
   */
  public getNextEvent(date: Date = new Date()): { title: string; description: string; body: BodyName } {
    const closest = this.getClosestPlanet(date)

    if (closest && closest.elongationDeg > 30) {
      const timeOfDay = closest.elongationDeg > 90 ? 'evening' : 'morning'
      return {
        title: `${closest.body} Visible`,
        description: `${closest.body} is well positioned for observation in the ${timeOfDay} sky at magnitude ${closest.magnitude?.toFixed(1)}.`,
        body: closest.body,
      }
    }

    // Default event
    return {
      title: 'Solar System Active',
      description: 'Explore the current positions of all planets in our Solar System.',
      body: 'Sun',
    }
  }
}

