/**
 * Aurora Service
 * Fetches and caches aurora forecast data from NOAA Space Weather Prediction Center
 */

interface OvationResponse {
  'Observation Time': string
  'Forecast Time': string
  coordinates: [number, number, number][] // [longitude, latitude, aurora_probability]
}

interface KpIndexEntry {
  time_tag: string
  Kp: number
  a_running: number
  station_count: number
}

export interface AuroraPoint {
  longitude: number
  latitude: number
  aurora: number
}

export interface AuroraData {
  observationTime: string
  forecastTime: string
  coordinates: AuroraPoint[]
  kpIndex: number
  kpTimestamp: string
}

export interface AuroraVisibility {
  visible: boolean
  probability: number
  kpIndex: number
  message: string
  nearbyMaxProbability: number
}

// In-memory cache (can be replaced with Redis later)
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache: Map<string, CacheEntry<unknown>> = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export default class AuroraService {
  private readonly ovationUrl = 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json'
  private readonly kpIndexUrl = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'

  /**
   * Fetch OVATION aurora data from NOAA
   */
  private async fetchOvationData(): Promise<OvationResponse> {
    const cached = getCached<OvationResponse>('ovation')
    if (cached) return cached

    const response = await fetch(this.ovationUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch OVATION aurora data: ${response.statusText}`)
    }

    const data = (await response.json()) as OvationResponse
    setCache('ovation', data)
    return data
  }

  /**
   * Fetch Kp index from NOAA
   */
  private async fetchKpIndex(): Promise<{ kp: number; timestamp: string }> {
    const cached = getCached<{ kp: number; timestamp: string }>('kp')
    if (cached) return cached

    const response = await fetch(this.kpIndexUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch Kp index: ${response.statusText}`)
    }

    const data = (await response.json()) as (string[] | KpIndexEntry)[]

    // Skip header row and get the latest entry
    const entries = data.slice(1) as KpIndexEntry[]
    const latest = entries[entries.length - 1]

    const result = {
      kp: typeof latest.Kp === 'number' ? latest.Kp : parseFloat(String(latest.Kp)) || 0,
      timestamp: latest.time_tag,
    }

    setCache('kp', result)
    return result
  }

  /**
   * Get complete aurora data with Kp index
   */
  public async getAuroraData(): Promise<AuroraData> {
    const [ovation, kpData] = await Promise.all([this.fetchOvationData(), this.fetchKpIndex()])

    // Convert NOAA's 0-360 longitude to -180 to 180 range
    const coordinates: AuroraPoint[] = ovation.coordinates.map(([lng, lat, aurora]) => ({
      longitude: lng > 180 ? lng - 360 : lng,
      latitude: lat,
      aurora: aurora,
    }))

    return {
      observationTime: ovation['Observation Time'],
      forecastTime: ovation['Forecast Time'],
      coordinates,
      kpIndex: kpData.kp,
      kpTimestamp: kpData.timestamp,
    }
  }

  /**
   * Check aurora visibility for a specific location
   */
  public async getVisibility(lat: number, lng: number): Promise<AuroraVisibility> {
    const auroraData = await this.getAuroraData()

    // Find closest point and nearby points
    let closestPoint: AuroraPoint | null = null
    let closestDistance = Infinity
    let nearbyMaxProbability = 0

    // Search radius in degrees (approximately 500km at equator)
    const searchRadius = 5

    for (const point of auroraData.coordinates) {
      const distance = Math.sqrt(
        Math.pow(point.latitude - lat, 2) + Math.pow(point.longitude - lng, 2)
      )

      if (distance < closestDistance) {
        closestDistance = distance
        closestPoint = point
      }

      // Check if within search radius
      if (distance <= searchRadius && point.aurora > nearbyMaxProbability) {
        nearbyMaxProbability = point.aurora
      }
    }

    const probability = closestPoint?.aurora ?? 0
    const kpIndex = auroraData.kpIndex

    // Determine visibility message
    let message: string
    let visible: boolean

    if (probability >= 50) {
      visible = true
      message = 'Excellent chance of aurora visibility! Look north (or south in southern hemisphere) for best views.'
    } else if (probability >= 30) {
      visible = true
      message = 'Good chance of aurora visibility. Clear, dark skies away from city lights recommended.'
    } else if (probability >= 10) {
      visible = true
      message = 'Possible aurora visibility. Best viewed with dark, clear skies and minimal light pollution.'
    } else if (nearbyMaxProbability >= 20) {
      visible = false
      message = `Low probability at your location, but aurora activity (${nearbyMaxProbability}%) detected nearby. Consider traveling north for better views.`
    } else {
      visible = false
      message = 'Low aurora activity in your area. Check back during geomagnetic storms for better chances.'
    }

    // Add Kp context
    if (kpIndex >= 5) {
      message += ` Current Kp index is ${kpIndex} (storm level) - increased aurora activity expected!`
    } else if (kpIndex >= 4) {
      message += ` Kp index is ${kpIndex} - moderate geomagnetic activity.`
    }

    return {
      visible,
      probability,
      kpIndex,
      message,
      nearbyMaxProbability,
    }
  }
}

