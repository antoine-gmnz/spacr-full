/**
 * EphemerisService
 *
 * Goal: Provide precise, geocentric, apparent-of-date positions and basic
 * observational properties for major solar system bodies to power the
 * 3D Space Explorer backend. It returns data needed for rendering and
 * labeling in a 3D scene (RA/Dec, distance, phase, elongation, 3D vectors,
 * and approximate angular size).
 */

import { Body, EquatorialCoordinates, Equator, Illumination, HelioVector, Observer } from '#lib/astronomy'

export type SupportedObjects = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune'
export type SupportedBody = typeof Body[keyof typeof Body]

export interface PlanetPosition {
  body: SupportedBody
  timestamp: string
  // Equatorial coordinates (geocentric, of-date)
  ra: number            // Right Ascension (degrees)
  dec: number           // Declination (degrees)
  distanceAu: number    // Geocentric distance (AU)
  // Observational properties
  phase: number         // Illumination fraction [0-1]
  magnitude?: number    // Apparent magnitude (if available)
  angularDiameterArcsec: number
  elongationDeg: number
  // 3D cartesian (geocentric) in AU
  x: number
  y: number
  z: number
}

/**
 * Equatorial radii (km) used to approximate apparent angular diameter
 * from the geocentric distance. Only defined for the bodies we plan to render.
 */
const EQUATORIAL_RADIUS_KM: Record<SupportedObjects, number> = {
  Sun: 695_700,
  Moon: 1_737.4,
  Mercury: 2_439.7,
  Venus: 6_051.8,
  Earth: 6_378.1,
  Mars: 3_389.5,
  Jupiter: 71_492,
  Saturn: 60_268,
  Uranus: 25_559,
  Neptune: 24_764,
}

const AU_KM = 149_597_870.7

const OBSERVER = new Observer(45.98589, 4.51111, 0)

/**
 * Convert radians to arcseconds.
 */
function radiansToArcseconds(rad: number): number {
  return rad * 206264.80624709636
}

/**
 * Approximate apparent angular diameter (arcsec) from body radius (km)
 * and geocentric distance (AU).
 */
function angularDiameterArcsec(equatorialRadiusKm: number, distanceAu: number): number {
  if (!distanceAu || distanceAu <= 0) return 0
  const radiusRad = Math.atan((equatorialRadiusKm / AU_KM) / distanceAu)
  return 2 * radiansToArcseconds(radiusRad)
}

/** Small helpers to convert deg <-> rad. */
function deg2rad(d: number): number { return (Math.PI / 180) * d }
function rad2deg(r: number): number { return (180 / Math.PI) * r }

/**
 * Convert RA/Dec (deg) to a unit vector in ICRS-like coordinates
 * (sufficient for small-angle computations like elongation).
 */
function radecToUnitVector(raDeg: number, decDeg: number): [number, number, number] {
  const ra = deg2rad(raDeg)
  const dec = deg2rad(decDeg)
  const cosd = Math.cos(dec)
  return [
    Math.cos(ra) * cosd,
    Math.sin(ra) * cosd,
    Math.sin(dec),
  ]
}

/**
 * Compute the angular separation (degrees) between two directions
 * given by RA/Dec pairs.
 */
function angleBetweenRadec(ra1: number, dec1: number, ra2: number, dec2: number): number {
  const [x1, y1, z1] = radecToUnitVector(ra1, dec1)
  const [x2, y2, z2] = radecToUnitVector(ra2, dec2)
  const dot = x1 * x2 + y1 * y2 + z1 * z2
  const clampDot = Math.min(1, Math.max(-1, dot))
  return rad2deg(Math.acos(clampDot))
}

export default class EphemerisService {
  /**
   * Default set of bodies to compute for the 3D explorer.
   */
  private readonly defaultBodies: SupportedBody[] = [
    Body.Sun, Body.Mercury, Body.Venus, Body.Mars, Body.Jupiter, Body.Saturn, Body.Uranus, Body.Neptune, Body.Earth,
  ]

  /**
   * Compute positions/observables for a list of bodies at a given time.
   * Returns geocentric, apparent-of-date RA/Dec, distance, elongation, phase,
   * and a geocentric 3D vector suitable for 3D rendering.
   */
  async getPlanetaryPositions(date: Date = new Date(), bodies: SupportedBody[] = this.defaultBodies): Promise<PlanetPosition[]> {
    const results: PlanetPosition[] = []

    // Pre-compute Sun apparent RA/Dec for elongation
    const sunEq = Equator(Body.Sun, date, OBSERVER, true, true)

    for (const body of bodies) {
      results.push(await this.getPlanetPosition(body, date, sunEq))
    }

    return results
  }

  /**
   * Compute ephemeris for a single body at a given time.
   * Includes RA/Dec, distance, phase (illumination), approximate
   * angular size, elongation from the Sun, and geocentric 3D vector.
   */
  async getPlanetPosition(body: SupportedBody, date: Date = new Date(), precomputedSun?: EquatorialCoordinates): Promise<PlanetPosition> {
    // Geocentric equatorial coordinates (apparent, of-date)
    const eq = Equator(body, date, OBSERVER, true, true)

    // Heliocentric vector (AU) so positions match heliocentric orbits in the scene
    const helioVec = HelioVector(body, date)

    // Illumination / phase / magnitude (where available)
    let phase = 1
    let magnitude: number | undefined
    try {
      const illum = Illumination(body, date)
      // Astronomy.Illumination().phase is phase angle (deg), .mag is magnitude, .phase_fraction is fraction
      // The TS types may vary; guard properties where needed.
      const anyIllum: any = illum
      if (typeof anyIllum.phase_fraction === 'number') phase = anyIllum.phase_fraction
      if (typeof anyIllum.mag === 'number') magnitude = anyIllum.mag
    } catch (_) {
      // Not all bodies support illumination (e.g., Earth), ignore
      phase = 1
    }

    // Angular diameter (arcsec) approximation from equatorial radius and geocentric distance
    const distAu = eq.dist
    const angDia = angularDiameterArcsec((EQUATORIAL_RADIUS_KM as any)[body] ?? 0, distAu)

    // Elongation from Sun (angle between body and Sun as seen from Earth)
    const sunEq = precomputedSun ?? Equator('Sun' as any, date, OBSERVER, true, true)
    const elong = angleBetweenRadec(eq.ra, eq.dec, sunEq.ra, sunEq.dec)

    return {
      body,
      timestamp: date.toISOString(),
      ra: eq.ra,
      dec: eq.dec,
      distanceAu: distAu,
      phase,
      magnitude,
      angularDiameterArcsec: angDia,
      elongationDeg: elong,
      x: helioVec.x,
      y: helioVec.y,
      z: helioVec.z,
    }
  }
}
