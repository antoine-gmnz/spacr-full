import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import CelestialPosition from './celestial_position.js'

export type CelestialBodyType = 'planet' | 'dwarf_planet' | 'asteroid' | 'comet' | 'moon' | 'star'

export default class CelestialBody extends BaseModel {
  static table = 'celestial_bodies'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare type: CelestialBodyType

  // Logarithmic mass storage (log10 of mass in kg)
  @column()
  declare massLog: number | null // log10(mass in kg) - efficient for all scales

  @column()
  declare radius: number | null // in km

  @column()
  declare orbitalPeriod: number | null // in Earth days

  @column()
  declare rotationPeriod: number | null // in Earth days

  @column()
  declare inclination: number | null // orbital inclination in degrees

  @column()
  declare eccentricity: number | null // orbital eccentricity

  @column()
  declare semiMajorAxis: number | null // in AU

  @column()
  declare textureUrl: string | null // 3D texture file

  @column()
  declare modelUrl: string | null // 3D model file

  @column()
  declare parentBodyId: number | null // for moons

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => value ? JSON.parse(value) : null
  })
  declare orbitalElements: any | null // Additional orbital parameters

  @column()
  declare description: string | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => CelestialBody, {
    foreignKey: 'parentBodyId'
  })
  declare parentBody: BelongsTo<typeof CelestialBody>

  @hasMany(() => CelestialBody, {
    foreignKey: 'parentBodyId'
  })
  declare moons: HasMany<typeof CelestialBody>

  @hasMany(() => CelestialPosition, {
    foreignKey: 'objectId'
  })
  declare positions: HasMany<typeof CelestialPosition>

  // Helper methods
  get isPlanet(): boolean {
    return this.type === 'planet'
  }

  get isMoon(): boolean {
    return this.type === 'moon'
  }

  get isAsteroid(): boolean {
    return this.type === 'asteroid'
  }

  get isComet(): boolean {
    return this.type === 'comet'
  }

  get isDwarfPlanet(): boolean {
    return this.type === 'dwarf_planet'
  }

  // Get the latest position
  async getLatestPosition(): Promise<CelestialPosition | null> {
    return await CelestialPosition.query()
      .where('objectId', this.id)
      .where('objectType', 'planet')
      .orderBy('timestamp', 'desc')
      .first()
  }

  // Get 3D model URL with fallback
  get modelUrlOrDefault(): string {
    return this.modelUrl || this.getDefaultModelUrl()
  }

  // Get texture URL with fallback
  get textureUrlOrDefault(): string {
    return this.textureUrl || this.getDefaultTextureUrl()
  }

  private getDefaultModelUrl(): string {
    const baseUrl = 'https://spacr-assets.s3.amazonaws.com/models'
    return `${baseUrl}/${this.type}/${this.name.toLowerCase().replace(/\s+/g, '_')}.glb`
  }

  private getDefaultTextureUrl(): string {
    const baseUrl = 'https://spacr-assets.s3.amazonaws.com/textures'
    return `${baseUrl}/${this.type}/${this.name.toLowerCase().replace(/\s+/g, '_')}.jpg`
  }

  // Get orbital period in Earth days
  get orbitalPeriodInDays(): number | null {
    return this.orbitalPeriod
  }

  // Get orbital period in Earth years
  get orbitalPeriodInYears(): number | null {
    return this.orbitalPeriod ? this.orbitalPeriod / 365.25 : null
  }

  // Get rotation period in Earth days
  get rotationPeriodInDays(): number | null {
    return this.rotationPeriod
  }

  // Get rotation period in Earth hours
  get rotationPeriodInHours(): number | null {
    return this.rotationPeriod ? this.rotationPeriod * 24 : null
  }

  // Get distance from Sun in AU
  get distanceFromSun(): number | null {
    return this.semiMajorAxis
  }

  // Get distance from Sun in km
  get distanceFromSunInKm(): number | null {
    return this.semiMajorAxis ? this.semiMajorAxis * 149597870.7 : null // 1 AU in km
  }

  // Mass conversion helpers using logarithmic storage
  get massInKg(): number | null {
    return this.massLog ? Math.pow(10, this.massLog) : null
  }

  get massInEarthMasses(): number | null {
    if (!this.massLog) return null
    const earthMassLog = 24.776 // log10(5.972e24)
    return Math.pow(10, this.massLog - earthMassLog)
  }

  get massInSolarMasses(): number | null {
    if (!this.massLog) return null
    const solarMassLog = 30.299 // log10(1.989e30)
    return Math.pow(10, this.massLog - solarMassLog)
  }

  // Get mass class based on logarithmic value
  get massClass(): string {
    if (!this.massLog) return 'unknown'
    
    if (this.massLog < 15) return 'asteroid'
    if (this.massLog < 20) return 'moon'
    if (this.massLog < 25) return 'terrestrial'
    if (this.massLog < 28) return 'gas_giant'
    if (this.massLog < 32) return 'star'
    return 'supergiant'
  }

  // Get surface gravity (approximate)
  get surfaceGravity(): number | null {
    if (!this.massLog || !this.radius) return null
    const earthGravity = 9.81 // m/s²
    const earthMassLog = 24.776 // log10(Earth mass)
    const earthRadius = 6371 // km
    
    const relativeMass = Math.pow(10, this.massLog - earthMassLog)
    const relativeRadius = this.radius / earthRadius
    
    return earthGravity * (relativeMass / (relativeRadius * relativeRadius))
  }

  // Get escape velocity in km/s
  get escapeVelocity(): number | null {
    if (!this.massLog || !this.radius) return null
    const G = 6.67430e-11 // m³/kg/s²
    const massInKg = Math.pow(10, this.massLog)
    const radiusInM = this.radius * 1000 // convert km to m
    
    return Math.sqrt((2 * G * massInKg) / radiusInM) / 1000 // convert to km/s
  }

  // Static methods for data seeding
  static async seedPlanets() {
    const planets = [
      {
        name: 'Mercury',
        type: 'planet' as CelestialBodyType,
        massLog: 23.517, // log10(3.285e23)
        radius: 2439.7,
        orbitalPeriod: 87.97,
        rotationPeriod: 58.646,
        inclination: 7.0,
        eccentricity: 0.2056,
        semiMajorAxis: 0.3871,
        description: 'The smallest and innermost planet in the Solar System.'
      },
      {
        name: 'Venus',
        type: 'planet' as CelestialBodyType,
        massLog: 24.687, // log10(4.867e24)
        radius: 6051.8,
        orbitalPeriod: 224.7,
        rotationPeriod: -243.025, // Retrograde rotation
        inclination: 3.4,
        eccentricity: 0.0068,
        semiMajorAxis: 0.7233,
        description: 'The second planet from the Sun, often called Earth\'s sister planet.'
      },
      {
        name: 'Earth',
        type: 'planet' as CelestialBodyType,
        massLog: 24.776, // log10(5.972e24)
        radius: 6371.0,
        orbitalPeriod: 365.25,
        rotationPeriod: 1.0,
        inclination: 0.0,
        eccentricity: 0.0167,
        semiMajorAxis: 1.0,
        description: 'Our home planet, the only known planet with life.'
      },
      {
        name: 'Mars',
        type: 'planet' as CelestialBodyType,
        massLog: 23.806, // log10(6.39e23)
        radius: 3389.5,
        orbitalPeriod: 686.98,
        rotationPeriod: 1.03,
        inclination: 1.9,
        eccentricity: 0.0934,
        semiMajorAxis: 1.524,
        description: 'The Red Planet, target for future human exploration.'
      },
      {
        name: 'Jupiter',
        type: 'planet' as CelestialBodyType,
        massLog: 27.278, // log10(1.898e27)
        radius: 69911,
        orbitalPeriod: 4332.59,
        rotationPeriod: 0.41,
        inclination: 1.3,
        eccentricity: 0.0489,
        semiMajorAxis: 5.203,
        description: 'The largest planet in our Solar System, a gas giant.'
      },
      {
        name: 'Saturn',
        type: 'planet' as CelestialBodyType,
        massLog: 26.755, // log10(5.683e26)
        radius: 58232,
        orbitalPeriod: 10759.22,
        rotationPeriod: 0.45,
        inclination: 2.5,
        eccentricity: 0.0565,
        semiMajorAxis: 9.537,
        description: 'The ringed planet, famous for its spectacular ring system.'
      },
      {
        name: 'Uranus',
        type: 'planet' as CelestialBodyType,
        massLog: 25.939, // log10(8.681e25)
        radius: 25362,
        orbitalPeriod: 30688.5,
        rotationPeriod: -0.72, // Retrograde rotation
        inclination: 0.8,
        eccentricity: 0.0473,
        semiMajorAxis: 19.191,
        description: 'An ice giant planet with a tilted axis of rotation.'
      },
      {
        name: 'Neptune',
        type: 'planet' as CelestialBodyType,
        massLog: 26.010, // log10(1.024e26)
        radius: 24622,
        orbitalPeriod: 60182,
        rotationPeriod: 0.67,
        inclination: 1.8,
        eccentricity: 0.0086,
        semiMajorAxis: 30.069,
        description: 'The farthest planet from the Sun, an ice giant.'
      }
    ]

    for (const planet of planets) {
      await CelestialBody.updateOrCreate(
        { name: planet.name },
        planet
      )
    }
  }

  static async seedDwarfPlanets() {
    const dwarfPlanets = [
      {
        name: 'Pluto',
        type: 'dwarf_planet' as CelestialBodyType,
        massLog: 22.117, // log10(1.309e22)
        radius: 1188.3,
        orbitalPeriod: 90520,
        rotationPeriod: -6.39, // Retrograde rotation
        inclination: 17.2,
        eccentricity: 0.2488,
        semiMajorAxis: 39.482,
        description: 'Formerly the ninth planet, now classified as a dwarf planet.'
      },
      {
        name: 'Ceres',
        type: 'dwarf_planet' as CelestialBodyType,
        massLog: 20.972, // log10(9.3835e20)
        radius: 473,
        orbitalPeriod: 1681.63,
        rotationPeriod: 0.378,
        inclination: 10.6,
        eccentricity: 0.0758,
        semiMajorAxis: 2.766,
        description: 'The largest object in the asteroid belt between Mars and Jupiter.'
      }
    ]

    for (const dwarfPlanet of dwarfPlanets) {
      await CelestialBody.updateOrCreate(
        { name: dwarfPlanet.name },
        dwarfPlanet
      )
    }
  }
}