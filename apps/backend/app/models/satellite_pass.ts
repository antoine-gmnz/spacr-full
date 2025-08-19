import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Satellite from './satellite.js'

export type PassType = 'visible' | 'daylight' | 'twilight'

export default class SatellitePass extends BaseModel {
  static table = 'satellite_passes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare satelliteId: number

  @column()
  declare locationLat: number | null

  @column()
  declare locationLon: number | null

  @column.dateTime()
  declare riseTime: DateTime | null

  @column.dateTime()
  declare setTime: DateTime | null

  @column()
  declare maxElevation: number | null // in degrees

  @column()
  declare durationMinutes: number | null

  @column()
  declare riseAzimuth: number | null // rise azimuth angle

  @column()
  declare setAzimuth: number | null // set azimuth angle

  @column()
  declare passType: PassType | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Satellite, {
    foreignKey: 'satelliteId'
  })
  declare satellite: BelongsTo<typeof Satellite>

  // Helper methods
  get isVisible(): boolean {
    return this.passType === 'visible'
  }

  get isDaylight(): boolean {
    return this.passType === 'daylight'
  }

  get isTwilight(): boolean {
    return this.passType === 'twilight'
  }

  get isHighPass(): boolean {
    return this.maxElevation !== null && this.maxElevation > 60
  }

  get isMediumPass(): boolean {
    return this.maxElevation !== null && this.maxElevation > 30 && this.maxElevation <= 60
  }

  get isLowPass(): boolean {
    return this.maxElevation !== null && this.maxElevation <= 30
  }

  get isLongPass(): boolean {
    return this.durationMinutes !== null && this.durationMinutes > 10
  }

  get isShortPass(): boolean {
    return this.durationMinutes !== null && this.durationMinutes <= 5
  }

  // Get pass duration in seconds
  get durationInSeconds(): number | null {
    return this.durationMinutes ? this.durationMinutes * 60 : null
  }

  // Get pass duration in hours
  get durationInHours(): number | null {
    return this.durationMinutes ? this.durationMinutes / 60 : null
  }

  // Get time until rise
  get timeUntilRise(): number | null {
    if (!this.riseTime) return null
    const now = DateTime.now()
    const rise = this.riseTime
    return rise > now ? rise.diff(now, 'minutes').minutes : null
  }

  // Get time since rise
  get timeSinceRise(): number | null {
    if (!this.riseTime) return null
    const now = DateTime.now()
    const rise = this.riseTime
    return rise < now ? now.diff(rise, 'minutes').minutes : null
  }

  // Check if pass is happening now
  get isHappeningNow(): boolean {
    if (!this.riseTime || !this.setTime) return false
    const now = DateTime.now()
    return now >= this.riseTime && now <= this.setTime
  }

  // Check if pass is in the future
  get isInFuture(): boolean {
    if (!this.riseTime) return false
    return DateTime.now() < this.riseTime
  }

  // Check if pass is in the past
  get isInPast(): boolean {
    if (!this.setTime) return false
    return DateTime.now() > this.setTime
  }

  // Get pass quality score (0-100)
  get qualityScore(): number {
    let score = 0
    
    // Elevation score (0-50 points)
    if (this.maxElevation !== null) {
      if (this.maxElevation > 80) score += 50
      else if (this.maxElevation > 60) score += 40
      else if (this.maxElevation > 45) score += 30
      else if (this.maxElevation > 30) score += 20
      else if (this.maxElevation > 15) score += 10
    }
    
    // Duration score (0-30 points)
    if (this.durationMinutes !== null) {
      if (this.durationMinutes > 10) score += 30
      else if (this.durationMinutes > 7) score += 25
      else if (this.durationMinutes > 5) score += 20
      else if (this.durationMinutes > 3) score += 15
      else if (this.durationMinutes > 1) score += 10
    }
    
    // Visibility score (0-20 points)
    if (this.isVisible) score += 20
    else if (this.isTwilight) score += 10
    
    return Math.min(score, 100)
  }

  // Get pass quality description
  get qualityDescription(): string {
    const score = this.qualityScore
    
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    if (score >= 50) return 'Poor'
    return 'Very Poor'
  }

  // Get pass direction
  get passDirection(): string {
    if (!this.riseAzimuth || !this.setAzimuth) return 'Unknown'
    
    const rise = this.riseAzimuth
    const set = this.setAzimuth
    
    if (rise >= 315 || rise < 45) return 'North'
    if (rise >= 45 && rise < 135) return 'East'
    if (rise >= 135 && rise < 225) return 'South'
    if (rise >= 225 && rise < 315) return 'West'
    
    return 'Unknown'
  }

  // Get pass orientation
  get passOrientation(): string {
    if (!this.riseAzimuth || !this.setAzimuth) return 'Unknown'
    
    const rise = this.riseAzimuth
    const set = this.setAzimuth
    const diff = Math.abs(set - rise)
    
    if (diff > 180) {
      const adjustedDiff = 360 - diff
      if (adjustedDiff < 30) return 'East-West'
      if (adjustedDiff < 60) return 'Southeast-Northwest'
      return 'Northeast-Southwest'
    } else {
      if (diff < 30) return 'North-South'
      if (diff < 60) return 'Northeast-Southwest'
      return 'Southeast-Northwest'
    }
  }

  // Static methods
  static async getUpcomingPasses(
    latitude: number, 
    longitude: number, 
    hours: number = 24,
    satelliteIds?: number[]
  ) {
    const query = SatellitePass.query()
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('riseTime', '>', DateTime.now().toJSDate())
      .where('riseTime', '<=', DateTime.now().plus({ hours }).toJSDate())
      .orderBy('riseTime', 'asc')
    
    if (satelliteIds && satelliteIds.length > 0) {
      query.whereIn('satelliteId', satelliteIds)
    }
    
    return await query
  }

  static async getVisiblePasses(
    latitude: number, 
    longitude: number, 
    hours: number = 24
  ) {
    return await SatellitePass.query()
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('passType', 'visible')
      .where('riseTime', '>', DateTime.now().toJSDate())
      .where('riseTime', '<=', DateTime.now().plus({ hours }).toJSDate())
      .orderBy('riseTime', 'asc')
  }

  static async getHighQualityPasses(
    latitude: number, 
    longitude: number, 
    hours: number = 24,
    minElevation: number = 45
  ) {
    return await SatellitePass.query()
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('maxElevation', '>=', minElevation)
      .where('riseTime', '>', DateTime.now().toJSDate())
      .where('riseTime', '<=', DateTime.now().plus({ hours }).toJSDate())
      .orderBy('maxElevation', 'desc')
  }

  static async getPassesForSatellite(
    satelliteId: number,
    latitude: number,
    longitude: number,
    days: number = 7
  ) {
    return await SatellitePass.query()
      .where('satelliteId', satelliteId)
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('riseTime', '>', DateTime.now().toJSDate())
      .where('riseTime', '<=', DateTime.now().plus({ days }).toJSDate())
      .orderBy('riseTime', 'asc')
  }

  static async getCurrentPasses(latitude: number, longitude: number) {
    const now = DateTime.now()
    
    return await SatellitePass.query()
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('riseTime', '<=', now.toJSDate())
      .where('setTime', '>=', now.toJSDate())
      .orderBy('maxElevation', 'desc')
  }

  static async getRecentPasses(
    latitude: number, 
    longitude: number, 
    hours: number = 24
  ) {
    return await SatellitePass.query()
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('setTime', '>', DateTime.now().minus({ hours }).toJSDate())
      .where('setTime', '<=', DateTime.now().toJSDate())
      .orderBy('setTime', 'desc')
  }

  static async getPassesByType(
    latitude: number,
    longitude: number,
    passType: PassType,
    hours: number = 24
  ) {
    return await SatellitePass.query()
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('passType', passType)
      .where('riseTime', '>', DateTime.now().toJSDate())
      .where('riseTime', '<=', DateTime.now().plus({ hours }).toJSDate())
      .orderBy('riseTime', 'asc')
  }

  static async cleanupOldPasses(daysToKeep: number = 7) {
    const cutoffDate = DateTime.now().minus({ days: daysToKeep })
    
    return await SatellitePass.query()
      .where('setTime', '<', cutoffDate.toJSDate())
      .delete()
  }

  // Get passes for ISS specifically
  static async getISSPasses(latitude: number, longitude: number, days: number = 7) {
    return await SatellitePass.query()
      .join('satellites', 'satellite_passes.satellite_id', 'satellites.id')
      .where('satellites.name', 'like', '%ISS%')
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('riseTime', '>', DateTime.now().toJSDate())
      .where('riseTime', '<=', DateTime.now().plus({ days }).toJSDate())
      .orderBy('riseTime', 'asc')
      .select('satellite_passes.*')
  }

  // Get passes for Starlink satellites
  static async getStarlinkPasses(latitude: number, longitude: number, days: number = 7) {
    return await SatellitePass.query()
      .join('satellites', 'satellite_passes.satellite_id', 'satellites.id')
      .where('satellites.name', 'like', '%Starlink%')
      .where('locationLat', latitude)
      .where('locationLon', longitude)
      .where('riseTime', '>', DateTime.now().toJSDate())
      .where('riseTime', '<=', DateTime.now().plus({ days }).toJSDate())
      .orderBy('riseTime', 'asc')
      .select('satellite_passes.*')
  }
}