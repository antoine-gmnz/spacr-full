import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import SatellitePass from './satellite_pass.js'
import CelestialPosition from './celestial_position.js'

export type SatelliteType = 'satellite' | 'spacecraft' | 'debris' | 'space_station'
export type SatelliteStatus = 'active' | 'inactive' | 'debris' | 'decayed'

export default class Satellite extends BaseModel {
  static table = 'satellites'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare noradId: number | null // NORAD catalog ID

  @column()
  declare type: SatelliteType | null

  @column.date()
  declare launchDate: DateTime | null

  @column()
  declare missionType: string | null

  @column()
  declare status: SatelliteStatus | null

  @column()
  declare tleLine1: string | null // Two-Line Element set

  @column()
  declare tleLine2: string | null

  @column()
  declare inclination: number | null // orbital inclination

  @column()
  declare eccentricity: number | null // orbital eccentricity

  @column()
  declare semiMajorAxis: number | null // in km

  @column()
  declare period: number | null // orbital period in minutes

  @column()
  declare country: string | null // launching country

  @column()
  declare operator: string | null // satellite operator

  @column()
  declare description: string | null

  @column.dateTime()
  declare lastUpdated: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @hasMany(() => SatellitePass, {
    foreignKey: 'satelliteId'
  })
  declare passes: HasMany<typeof SatellitePass>

  @hasMany(() => CelestialPosition, {
    foreignKey: 'objectId'
  })
  declare positions: HasMany<typeof CelestialPosition>

  // Helper methods
  get isActive(): boolean {
    return this.status === 'active'
  }

  get isSpaceStation(): boolean {
    return this.type === 'space_station'
  }

  get isDebris(): boolean {
    return this.type === 'debris' || this.status === 'debris'
  }

  get isISS(): boolean {
    return this.name.toLowerCase().includes('iss') || 
           this.name.toLowerCase().includes('international space station')
  }

  get isStarlink(): boolean {
    return this.name.toLowerCase().includes('starlink')
  }

  get isGPS(): boolean {
    return this.name.toLowerCase().includes('gps') || 
           this.missionType?.toLowerCase().includes('navigation') ||
           this.name.toLowerCase().includes('global positioning system')
  }

  // Get orbital period in hours
  get orbitalPeriodInHours(): number | null {
    return this.period ? this.period / 60 : null
  }

  // Get orbital period in days
  get orbitalPeriodInDays(): number | null {
    return this.period ? this.period / (60 * 24) : null
  }

  // Get altitude (approximate)
  get altitude(): number | null {
    if (!this.semiMajorAxis) return null
    const earthRadius = 6371 // km
    return this.semiMajorAxis - earthRadius
  }

  // Get orbital velocity (approximate)
  get orbitalVelocity(): number | null {
    if (!this.semiMajorAxis || !this.period) return null
    const circumference = 2 * Math.PI * this.semiMajorAxis
    const periodInSeconds = this.period * 60
    return circumference / periodInSeconds // km/s
  }

  // Check if TLE data is valid
  get hasValidTLE(): boolean {
    return !!(this.tleLine1 && this.tleLine2 && 
              this.tleLine1.length >= 69 && this.tleLine2.length >= 69)
  }

  // Get TLE epoch date
  get tleEpoch(): DateTime | null {
    if (!this.tleLine1) return null
    
    try {
      const year = parseInt(this.tleLine1.substring(18, 20))
      const dayOfYear = parseFloat(this.tleLine1.substring(20, 32))
      
      // Convert 2-digit year to 4-digit year
      const fullYear = year < 57 ? 2000 + year : 1900 + year
      
      // Create date from year and day of year
      const date = new Date(fullYear, 0, 1) // January 1st of the year
      date.setDate(date.getDate() + dayOfYear - 1) // Add days (subtract 1 because day 1 is January 1st)
      
      return DateTime.fromJSDate(date)
    } catch (error) {
      return null
    }
  }

  // Get TLE age in days
  get tleAge(): number | null {
    const epoch = this.tleEpoch
    if (!epoch) return null
    
    return DateTime.now().diff(epoch, 'days').days
  }

  // Check if TLE is fresh (less than 7 days old)
  get isTLEFresh(): boolean {
    const age = this.tleAge
    return age !== null && age <= 7
  }

  // Get satellite category based on altitude
  get altitudeCategory(): string {
    const alt = this.altitude
    if (!alt) return 'Unknown'
    
    if (alt < 2000) return 'Low Earth Orbit (LEO)'
    if (alt < 35786) return 'Medium Earth Orbit (MEO)'
    if (alt < 35786 + 1000) return 'Geosynchronous Orbit (GEO)'
    return 'High Earth Orbit (HEO)'
  }

  // Get visibility category
  get visibilityCategory(): string {
    if (this.isISS) return 'Space Station'
    if (this.isStarlink) return 'Internet Constellation'
    if (this.isGPS) return 'Navigation'
    if (this.type === 'spacecraft') return 'Spacecraft'
    if (this.isDebris) return 'Space Debris'
    return 'Satellite'
  }

  // Static methods for data seeding
  static async seedISS() {
    const iss = {
      name: 'International Space Station',
      noradId: 25544,
      type: 'space_station' as SatelliteType,
      launchDate: DateTime.fromISO('1998-11-20'),
      missionType: 'Space Station',
      status: 'active' as SatelliteStatus,
      country: 'International',
      operator: 'NASA/ESA/JAXA/CSA/Roscosmos',
      description: 'The International Space Station is a modular space station in low Earth orbit.',
      inclination: 51.64,
      eccentricity: 0.0004,
      semiMajorAxis: 6778.1,
      period: 92.68,
      lastUpdated: DateTime.now()
    }

    await Satellite.updateOrCreate(
      { noradId: iss.noradId },
      iss
    )
  }

  static async seedStarlinkSatellites() {
    // Seed a few example Starlink satellites
    const starlinkSatellites = [
      {
        name: 'Starlink-1',
        noradId: 44235,
        type: 'satellite' as SatelliteType,
        launchDate: DateTime.fromISO('2019-05-24'),
        missionType: 'Internet Constellation',
        status: 'active' as SatelliteStatus,
        country: 'USA',
        operator: 'SpaceX',
        description: 'Starlink satellite for global internet coverage.',
        inclination: 53.0,
        eccentricity: 0.0001,
        semiMajorAxis: 6928.0,
        period: 95.0,
        lastUpdated: DateTime.now()
      },
      {
        name: 'Starlink-2',
        noradId: 44236,
        type: 'satellite' as SatelliteType,
        launchDate: DateTime.fromISO('2019-05-24'),
        missionType: 'Internet Constellation',
        status: 'active' as SatelliteStatus,
        country: 'USA',
        operator: 'SpaceX',
        description: 'Starlink satellite for global internet coverage.',
        inclination: 53.0,
        eccentricity: 0.0001,
        semiMajorAxis: 6928.0,
        period: 95.0,
        lastUpdated: DateTime.now()
      }
    ]

    for (const satellite of starlinkSatellites) {
      await Satellite.updateOrCreate(
        { noradId: satellite.noradId },
        satellite
      )
    }
  }

  // Get active satellites
  static async getActiveSatellites() {
    return await Satellite.query()
      .where('status', 'active')
      .orderBy('name', 'asc')
  }

  // Get satellites by type
  static async getSatellitesByType(type: SatelliteType) {
    return await Satellite.query()
      .where('type', type)
      .orderBy('name', 'asc')
  }

  // Get satellites by country
  static async getSatellitesByCountry(country: string) {
    return await Satellite.query()
      .where('country', country)
      .orderBy('name', 'asc')
  }

  // Get satellites needing TLE updates
  static async getSatellitesNeedingTLEUpdate() {
    return await Satellite.query()
      .whereNotNull('tleLine1')
      .whereNotNull('tleLine2')
      .where('lastUpdated', '<', DateTime.now().minus({ days: 7 }).toJSDate())
      .orderBy('lastUpdated', 'asc')
  }

  // Get satellites in specific altitude range
  static async getSatellitesInAltitudeRange(minAlt: number, maxAlt: number) {
    const earthRadius = 6371 // km
    const minSMA = earthRadius + minAlt
    const maxSMA = earthRadius + maxAlt
    
    return await Satellite.query()
      .whereBetween('semiMajorAxis', [minSMA, maxSMA])
      .orderBy('semiMajorAxis', 'asc')
  }
}