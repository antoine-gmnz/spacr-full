import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type ObjectType = 'planet' | 'star' | 'satellite' | 'asteroid' | 'comet' | 'moon'

export default class CelestialPosition extends BaseModel {
  static table = 'celestial_positions'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare objectId: number

  @column()
  declare objectType: ObjectType

  @column.dateTime()
  declare timestamp: DateTime

  @column()
  declare ra: number | null // Right Ascension in degrees

  @column()
  declare dec: number | null // Declination in degrees

  @column()
  declare distance: number | null // Distance from Earth

  @column()
  declare magnitude: number | null // Apparent magnitude

  @column()
  declare phase: number | null // Illumination phase (0-1)

  @column()
  declare angularSize: number | null // Apparent size in arcseconds

  @column()
  declare xCoord: number | null // 3D Cartesian coordinates

  @column()
  declare yCoord: number | null

  @column()
  declare zCoord: number | null

  @column()
  declare elongation: number | null // Angular distance from Sun

  @column()
  declare altitude: number | null // Altitude above horizon (if applicable)

  @column()
  declare azimuth: number | null // Azimuth angle (if applicable)

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper methods
  get isVisible(): boolean {
    return this.altitude !== null && this.altitude > 0
  }

  get isAboveHorizon(): boolean {
    return this.altitude !== null && this.altitude > 0
  }

  get isInDaylight(): boolean {
    return this.altitude !== null && this.altitude > 0 && this.elongation !== null && this.elongation < 90
  }

  get isInTwilight(): boolean {
    return this.altitude !== null && this.altitude > -18 && this.altitude < 0
  }

  get isInDarkness(): boolean {
    return this.altitude !== null && this.altitude < -18
  }

  // Get position age in minutes
  get ageInMinutes(): number {
    return DateTime.now().diff(this.timestamp, 'minutes').minutes
  }

  // Get position age in hours
  get ageInHours(): number {
    return DateTime.now().diff(this.timestamp, 'hours').hours
  }

  // Check if position is recent (less than 1 hour old)
  get isRecent(): boolean {
    return this.ageInHours < 1
  }

  // Get 3D position as array
  get position3D(): [number, number, number] | null {
    if (this.xCoord !== null && this.yCoord !== null && this.zCoord !== null) {
      return [this.xCoord, this.yCoord, this.zCoord]
    }
    return null
  }

  // Get 2D position as array (RA, Dec)
  get position2D(): [number, number] | null {
    if (this.ra !== null && this.dec !== null) {
      return [this.ra, this.dec]
    }
    return null
  }

  // Get distance in AU
  get distanceInAU(): number | null {
    return this.distance ? this.distance / 149597870.7 : null // Convert km to AU
  }

  // Get distance in light years
  get distanceInLightYears(): number | null {
    return this.distance ? this.distance / (9.461e12) : null // Convert km to light years
  }

  // Get angular size in arcminutes
  get angularSizeInArcminutes(): number | null {
    return this.angularSize ? this.angularSize / 60 : null
  }

  // Get angular size in degrees
  get angularSizeInDegrees(): number | null {
    return this.angularSize ? this.angularSize / 3600 : null
  }

  // Get phase as percentage
  get phasePercentage(): number | null {
    return this.phase ? this.phase * 100 : null
  }

  // Get phase description
  get phaseDescription(): string {
    if (this.phase === null) return 'Unknown'
    
    if (this.phase === 0) return 'New'
    if (this.phase < 0.25) return 'Waxing Crescent'
    if (this.phase === 0.25) return 'First Quarter'
    if (this.phase < 0.5) return 'Waxing Gibbous'
    if (this.phase === 0.5) return 'Full'
    if (this.phase < 0.75) return 'Waning Gibbous'
    if (this.phase === 0.75) return 'Last Quarter'
    if (this.phase < 1) return 'Waning Crescent'
    return 'New'
  }

  // Get visibility conditions
  get visibilityConditions(): string {
    if (!this.isVisible) return 'Below Horizon'
    if (this.isInDaylight) return 'Daylight'
    if (this.isInTwilight) return 'Twilight'
    return 'Dark'
  }

  // Static methods
  static async getLatestPosition(objectId: number, objectType: ObjectType) {
    return await CelestialPosition.query()
      .where('objectId', objectId)
      .where('objectType', objectType)
      .orderBy('timestamp', 'desc')
      .first()
  }

  static async getPositionsInTimeRange(
    objectId: number, 
    objectType: ObjectType, 
    startTime: DateTime, 
    endTime: DateTime
  ) {
    return await CelestialPosition.query()
      .where('objectId', objectId)
      .where('objectType', objectType)
      .whereBetween('timestamp', [startTime.toJSDate(), endTime.toJSDate()])
      .orderBy('timestamp', 'asc')
  }

  static async getVisibleObjects(latitude: number, longitude: number, time: DateTime = DateTime.now()) {
    return await CelestialPosition.query()
      .where('altitude', '>', 0)
      .where('timestamp', '>=', time.minus({ hours: 1 }).toJSDate())
      .orderBy('magnitude', 'asc')
  }

  static async getObjectsByType(objectType: ObjectType, limit: number = 100) {
    return await CelestialPosition.query()
      .where('objectType', objectType)
      .where('timestamp', '>=', DateTime.now().minus({ hours: 24 }).toJSDate())
      .orderBy('timestamp', 'desc')
      .limit(limit)
  }

  static async getBrightObjects(magnitudeLimit: number = 6.0) {
    return await CelestialPosition.query()
      .where('magnitude', '<=', magnitudeLimit)
      .where('timestamp', '>=', DateTime.now().minus({ hours: 1 }).toJSDate())
      .orderBy('magnitude', 'asc')
  }

  static async getObjectsInConstellation(
    constellationRA: number, 
    constellationDec: number, 
    radius: number = 10
  ) {
    return await CelestialPosition.query()
      .whereRaw('SQRT(POWER(ra - ?, 2) + POWER(dec - ?, 2)) <= ?', [
        constellationRA, 
        constellationDec, 
        radius
      ])
      .where('timestamp', '>=', DateTime.now().minus({ hours: 1 }).toJSDate())
      .orderBy('magnitude', 'asc')
  }

  static async cleanupOldPositions(daysToKeep: number = 30) {
    const cutoffDate = DateTime.now().minus({ days: daysToKeep })
    
    return await CelestialPosition.query()
      .where('timestamp', '<', cutoffDate.toJSDate())
      .delete()
  }

  // Get positions for 3D visualization
  static async getPositionsFor3DScene(objectTypes: ObjectType[] = ['planet', 'star']) {
    return await CelestialPosition.query()
      .whereIn('objectType', objectTypes)
      .where('timestamp', '>=', DateTime.now().minus({ hours: 1 }).toJSDate())
      .whereNotNull('xCoord')
      .whereNotNull('yCoord')
      .whereNotNull('zCoord')
      .orderBy('objectType', 'asc')
      .orderBy('magnitude', 'asc')
  }

  // Get positions for sky map
  static async getPositionsForSkyMap(latitude: number, longitude: number) {
    return await CelestialPosition.query()
      .where('altitude', '>', -10) // Include objects slightly below horizon
      .where('timestamp', '>=', DateTime.now().minus({ hours: 1 }).toJSDate())
      .orderBy('altitude', 'desc')
      .orderBy('magnitude', 'asc')
  }
}