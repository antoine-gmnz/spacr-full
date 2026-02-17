/**
 * ISS Service
 * Fetches and caches ISS TLE data, calculates positions, and retrieves crew information
 */

import * as satellite from 'satellite.js'

interface TLEData {
  line1: string
  line2: string
  timestamp: number
}

interface ISSCrewResponse {
  message: string
  number: number
  people: Array<{
    craft: string
    name: string
  }>
}

export interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number // km
  velocity: number // km/s
  timestamp: string
}

export interface ISSCrewMember {
  name: string
  craft: string
}

export interface ISSPass {
  riseTime: string
  setTime: string
  maxElevation: number // degrees
  duration: number // minutes
  riseAzimuth: number // degrees
  setAzimuth: number // degrees
}

// In-memory cache (can be replaced with Redis later)
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache: Map<string, CacheEntry<unknown>> = new Map()
const TLE_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const POSITION_CACHE_TTL_MS = 60 * 1000 // 1 minute
const CREW_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const PASS_CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > TLE_CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T, ttl?: number): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export default class ISSService {
  private readonly tleUrl = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE'
  private readonly crewUrl = 'http://api.open-notify.org/astros.json'
  private readonly ISS_NORAD_ID = 25544

  /**
   * Fetch ISS TLE data from Celestrak
   */
  private async fetchTLE(): Promise<TLEData> {
    const cached = getCached<TLEData>('iss-tle')
    if (cached) return cached

    const response = await fetch(this.tleUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch ISS TLE data: ${response.statusText}`)
    }

    const text = await response.text()
    const lines = text.trim().split('\n')

    if (lines.length < 2) {
      throw new Error('Invalid TLE data format')
    }

    // TLE format: line 0 is name, line 1 is line1, line 2 is line2
    const line1 = lines[1]?.trim() || ''
    const line2 = lines[2]?.trim() || ''

    if (!line1 || !line2) {
      throw new Error('Invalid TLE data: missing lines')
    }

    const tleData: TLEData = {
      line1,
      line2,
      timestamp: Date.now(),
    }

    setCache('iss-tle', tleData)
    return tleData
  }

  /**
   * Calculate ISS position from TLE data
   */
  public async getPosition(date: Date = new Date()): Promise<ISSPosition> {
    const cacheKey = `iss-position-${Math.floor(date.getTime() / 60000)}` // Cache by minute
    const cached = getCached<ISSPosition>(cacheKey)
    if (cached) return cached

    const tleData = await this.fetchTLE()
    const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2)

    // Propagate satellite position
    const positionAndVelocity = satellite.propagate(satrec, date)

    if (!positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      throw new Error('Failed to calculate ISS position')
    }

    const positionEci = positionAndVelocity.position
    const velocityEci = positionAndVelocity.velocity

    // Convert ECI to geodetic coordinates
    const gmst = satellite.gstime(date)
    const positionGd = satellite.eciToGeodetic(positionEci, gmst)

    const latitude = satellite.degreesLat(positionGd.latitude)
    const longitude = satellite.degreesLong(positionGd.longitude)
    const altitude = positionGd.height // km

    // Calculate velocity magnitude
    let velocity = 0
    if (velocityEci && typeof velocityEci !== 'boolean') {
      const vx = velocityEci.x
      const vy = velocityEci.y
      const vz = velocityEci.z
      velocity = Math.sqrt(vx * vx + vy * vy + vz * vz) / 1000 // Convert m/s to km/s
    }

    const position: ISSPosition = {
      latitude,
      longitude,
      altitude,
      velocity,
      timestamp: date.toISOString(),
    }

    setCache(cacheKey, position, POSITION_CACHE_TTL_MS)
    return position
  }

  /**
   * Fetch ISS crew information from Open Notify API
   */
  public async getCrew(): Promise<ISSCrewMember[]> {
    const cached = getCached<ISSCrewMember[]>('iss-crew')
    if (cached) return cached

    try {
      const response = await fetch(this.crewUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch ISS crew data: ${response.statusText}`)
      }

      const data = (await response.json()) as ISSCrewResponse

      const crew = data.people
        .filter(person => person.craft === 'ISS')
        .map(person => ({
          name: person.name,
          craft: person.craft,
        }))

      setCache('iss-crew', crew, CREW_CACHE_TTL_MS)
      return crew
    } catch (error) {
      // Return empty array on error rather than throwing
      console.error('Error fetching ISS crew:', error)
      return []
    }
  }

  /**
   * Calculate elevation and azimuth from observer to satellite
   * Uses simplified calculation based on geodetic positions
   */
  private calculateLookAngles(
    observerLat: number,
    observerLng: number,
    observerAlt: number,
    positionEci: satellite.EciVec3<number>,
    gmst: number
  ): { elevation: number; azimuth: number } | null {
    try {
      // Get satellite geodetic position
      const satGd = satellite.eciToGeodetic(positionEci, gmst)
      const satLat = satellite.degreesLat(satGd.latitude)
      const satLng = satellite.degreesLong(satGd.longitude)
      const satAlt = satGd.height / 1000 // Convert to km

      // Earth radius in km
      const R = 6371

      // Convert to radians
      const obsLatRad = (observerLat * Math.PI) / 180
      const obsLngRad = (observerLng * Math.PI) / 180
      const satLatRad = (satLat * Math.PI) / 180
      const satLngRad = (satLng * Math.PI) / 180

      // Calculate distance and bearing
      const dLat = satLatRad - obsLatRad
      const dLng = satLngRad - obsLngRad

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(obsLatRad) * Math.cos(satLatRad) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c // Great circle distance in km

      // Calculate azimuth
      const y = Math.sin(dLng) * Math.cos(satLatRad)
      const x =
        Math.cos(obsLatRad) * Math.sin(satLatRad) -
        Math.sin(obsLatRad) * Math.cos(satLatRad) * Math.cos(dLng)
      const azimuth = (Math.atan2(y, x) * 180) / Math.PI
      const azimuthNormalized = azimuth < 0 ? azimuth + 360 : azimuth

      // Calculate elevation using simple geometry
      // Approximate elevation based on altitude difference and distance
      const altDiff = satAlt - observerAlt
      const elevation = (Math.atan2(altDiff, distance) * 180) / Math.PI

      return { elevation, azimuth: azimuthNormalized }
    } catch (error) {
      return null
    }
  }

  /**
   * Calculate upcoming ISS passes for a given location
   */
  public async getPasses(
    latitude: number,
    longitude: number,
    altitude: number = 0,
    days: number = 10
  ): Promise<ISSPass[]> {
    const cacheKey = `iss-passes-${latitude.toFixed(2)}-${longitude.toFixed(2)}-${altitude}-${days}`
    const cached = getCached<ISSPass[]>(cacheKey)
    if (cached) return cached

    const tleData = await this.fetchTLE()
    const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2)

    const passes: ISSPass[] = []
    const now = new Date()
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    // Check every 30 seconds for passes (more efficient than every minute)
    let currentTime = new Date(now)
    let wasVisible = false
    let passStart: Date | null = null
    let maxElevation = 0
    let maxElevationTime: Date | null = null
    let riseAzimuth = 0
    let setAzimuth = 0

    while (currentTime <= endDate) {
      const positionAndVelocity = satellite.propagate(satrec, currentTime)

      if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
        const positionEci = positionAndVelocity.position
        const gmst = satellite.gstime(currentTime)
        const lookAngles = this.calculateLookAngles(latitude, longitude, altitude, positionEci, gmst)

        if (lookAngles) {
          const elevation = lookAngles.elevation
          const azimuth = lookAngles.azimuth

          if (elevation > 0) {
            // Satellite is above horizon
            if (!wasVisible) {
              // Pass just started
              passStart = new Date(currentTime)
              maxElevation = elevation
              maxElevationTime = new Date(currentTime)
              riseAzimuth = azimuth
            } else {
              // Update max elevation
              if (elevation > maxElevation) {
                maxElevation = elevation
                maxElevationTime = new Date(currentTime)
              }
            }
            wasVisible = true
            setAzimuth = azimuth // Update set azimuth as we go
          } else {
            // Satellite went below horizon
            if (wasVisible && passStart && maxElevationTime) {
              // Pass ended, record it
              const passEnd = new Date(currentTime)
              const duration = Math.round((passEnd.getTime() - passStart.getTime()) / 1000 / 60) // minutes

              passes.push({
                riseTime: passStart.toISOString(),
                setTime: passEnd.toISOString(),
                maxElevation: Math.round(maxElevation * 10) / 10,
                duration,
                riseAzimuth: Math.round(riseAzimuth * 10) / 10,
                setAzimuth: Math.round(setAzimuth * 10) / 10,
              })

              // Limit to 20 passes to avoid excessive computation
              if (passes.length >= 20) {
                break
              }
            }
            wasVisible = false
            passStart = null
            maxElevation = 0
            maxElevationTime = null
          }
        }
      }

      // Increment by 30 seconds
      currentTime = new Date(currentTime.getTime() + 30 * 1000)
    }

    setCache(cacheKey, passes, PASS_CACHE_TTL_MS)
    return passes
  }
}

