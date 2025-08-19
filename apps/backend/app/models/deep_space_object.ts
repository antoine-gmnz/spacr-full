import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export type DeepSpaceObjectType = 'galaxy' | 'nebula' | 'cluster' | 'quasar' | 'pulsar' | 'black_hole'

export type DeepSpaceObjectPhysicalCharacteristics = {
  type: string
  size: string
  mass?: string
  age?: string
}

export default class DeepSpaceObject extends BaseModel {
  static table = 'deep_space_objects'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare catalogName: string | null // NGC, Messier, etc.

  @column()
  declare type: DeepSpaceObjectType | null

  @column()
  declare ra: number | null // Right Ascension

  @column()
  declare dec: number | null // Declination

  @column()
  declare magnitude: number | null // Apparent magnitude

  @column()
  declare distanceLog: number | null // log10(distance in light years) - astronomical precision

  @column()
  declare angularSize: number | null // in arcminutes

  @column()
  declare constellation: string | null

  @column()
  declare description: string | null

  @column()
  declare discoverer: string | null

  @column()
  declare discoveryYear: number | null

  @column()
  declare isVisibleNakedEye: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper methods for logarithmic conversions
  get distance(): number | null {
    return this.distanceLog ? Math.pow(10, this.distanceLog) : null
  }

  // Helper methods
  get isGalaxy(): boolean {
    return this.type === 'galaxy'
  }

  get isNebula(): boolean {
    return this.type === 'nebula'
  }

  get isCluster(): boolean {
    return this.type === 'cluster'
  }

  get isQuasar(): boolean {
    return this.type === 'quasar'
  }

  get isPulsar(): boolean {
    return this.type === 'pulsar'
  }

  get isBlackHole(): boolean {
    return this.type === 'black_hole'
  }

  get isBright(): boolean {
    return this.magnitude !== null && this.magnitude <= 6.0
  }

  get isVeryBright(): boolean {
    return this.magnitude !== null && this.magnitude <= 3.0
  }

  get isLarge(): boolean {
    return this.angularSize !== null && this.angularSize > 30 // larger than 30 arcminutes
  }

  get isSmall(): boolean {
    return this.angularSize !== null && this.angularSize < 5 // smaller than 5 arcminutes
  }

  get isNearby(): boolean {
    return this.distance !== null && this.distance < 10000 // within 10,000 light years
  }

  get isDistant(): boolean {
    return this.distance !== null && this.distance > 1000000 // more than 1 million light years
  }

  // Get angular size in degrees
  get angularSizeInDegrees(): number | null {
    return this.angularSize ? this.angularSize / 60 : null
  }

  // Get angular size in arcseconds
  get angularSizeInArcseconds(): number | null {
    return this.angularSize ? this.angularSize * 60 : null
  }

  // Get distance in parsecs
  get distanceInParsecs(): number | null {
    return this.distance ? this.distance / 3.26156 : null
  }

  // Get distance in megaparsecs
  get distanceInMegaparsecs(): number | null {
    return this.distance ? this.distance / (3.26156 * 1000000) : null
  }

  // Get physical size in light years (approximate)
  get physicalSizeInLightYears(): number | null {
    if (!this.angularSize || !this.distance) return null
    
    // Convert angular size to radians, then multiply by distance
    const angularSizeInRadians = (this.angularSize / 60) * (Math.PI / 180)
    return angularSizeInRadians * this.distance
  }

  // Get physical size in parsecs
  get physicalSizeInParsecs(): number | null {
    const sizeInLy = this.physicalSizeInLightYears
    return sizeInLy ? sizeInLy / 3.26156 : null
  }

  // Get age estimate (very approximate)
  get estimatedAge(): number | null {
    if (!this.type || !this.distance) return null
    
    // Very rough estimates based on object type and distance
    const ageMap: Record<DeepSpaceObjectType, number> = {
      'galaxy': 13.8, // billions of years
      'nebula': 0.01, // millions of years
      'cluster': 10.0, // billions of years
      'quasar': 12.0, // billions of years
      'pulsar': 0.001, // millions of years
      'black_hole': 13.0 // billions of years
    }
    
    return ageMap[this.type] || null
  }

  // Get object category for display
  get displayCategory(): string {
    if (this.isGalaxy) return 'Galaxy'
    if (this.isNebula) return 'Nebula'
    if (this.isCluster) return 'Star Cluster'
    if (this.isQuasar) return 'Quasar'
    if (this.isPulsar) return 'Pulsar'
    if (this.isBlackHole) return 'Black Hole'
    return 'Deep Space Object'
  }

  // Get difficulty level for observation
  get observationDifficulty(): string {
    if (this.isVisibleNakedEye) return 'Naked Eye'
    if (this.magnitude !== null && this.magnitude <= 6) return 'Easy'
    if (this.magnitude !== null && this.magnitude <= 9) return 'Moderate'
    if (this.magnitude !== null && this.magnitude <= 12) return 'Difficult'
    return 'Very Difficult'
  }

  // Get best viewing conditions
  get bestViewingConditions(): string {
    if (this.isVisibleNakedEye) return 'Dark sky, no moon'
    if (this.magnitude !== null && this.magnitude <= 8) return 'Dark sky, small telescope'
    if (this.magnitude !== null && this.magnitude <= 12) return 'Dark sky, medium telescope'
    return 'Dark sky, large telescope'
  }

  // Static methods for data seeding
  static async seedMessierObjects() {
    const messierObjects = [
      {
        name: 'Andromeda Galaxy',
        catalogName: 'M31',
        type: 'galaxy' as DeepSpaceObjectType,
        ra: 10.6847,
        dec: 41.2692,
        magnitude: 3.44,
        distanceLog: 6.404, // log10(2537000)
        angularSize: 190, // 3.2 degrees
        constellation: 'Andromeda',
        description: 'The Andromeda Galaxy is the closest spiral galaxy to the Milky Way and the largest galaxy in the Local Group.',
        discoverer: 'Charles Messier',
        discoveryYear: 1764,
        isVisibleNakedEye: true
      },
      {
        name: 'Orion Nebula',
        catalogName: 'M42',
        type: 'nebula' as DeepSpaceObjectType,
        ra: 83.8221,
        dec: -5.3911,
        magnitude: 4.0,
        distanceLog: 3.128, // log10(1344)
        angularSize: 85, // 1.4 degrees
        constellation: 'Orion',
        description: 'The Orion Nebula is one of the brightest nebulae visible to the naked eye and is the closest region of massive star formation to Earth.',
        discoverer: 'Nicolas-Claude Fabri de Peiresc',
        discoveryYear: 1610,
        isVisibleNakedEye: true
      },
      {
        name: 'Pleiades',
        catalogName: 'M45',
        type: 'cluster' as DeepSpaceObjectType,
        ra: 56.8711,
        dec: 24.1053,
        magnitude: 1.6,
        distanceLog: 2.647, // log10(444)
        angularSize: 110, // 1.8 degrees
        constellation: 'Taurus',
        description: 'The Pleiades, also known as the Seven Sisters, is an open star cluster containing middle-aged, hot B-type stars.',
        discoverer: 'Ancient',
        discoveryYear: -1000,
        isVisibleNakedEye: true
      },
      {
        name: 'Crab Nebula',
        catalogName: 'M1',
        type: 'nebula' as DeepSpaceObjectType,
        ra: 83.6331,
        dec: 22.0144,
        magnitude: 8.4,
        distanceLog: 3.813, // log10(6500)
        angularSize: 6, // 6 arcminutes
        constellation: 'Taurus',
        description: 'The Crab Nebula is a supernova remnant and pulsar wind nebula in the constellation of Taurus.',
        discoverer: 'John Bevis',
        discoveryYear: 1731,
        isVisibleNakedEye: false
      },
      {
        name: 'Whirlpool Galaxy',
        catalogName: 'M51',
        type: 'galaxy' as DeepSpaceObjectType,
        ra: 202.4696,
        dec: 47.1952,
        magnitude: 8.4,
        distanceLog: 7.491, // log10(31000000)
        angularSize: 11, // 11 arcminutes
        constellation: 'Canes Venatici',
        description: 'The Whirlpool Galaxy is an interacting grand-design spiral galaxy with a smaller companion galaxy.',
        discoverer: 'Charles Messier',
        discoveryYear: 1773,
        isVisibleNakedEye: false
      }
    ]

    for (const object of messierObjects) {
      await DeepSpaceObject.updateOrCreate(
        { catalogName: object.catalogName },
        object
      )
    }
  }

  // Get objects by type
  static async getObjectsByType(type: DeepSpaceObjectType) {
    return await DeepSpaceObject.query()
      .where('type', type)
      .orderBy('magnitude', 'asc')
  }

  // Get objects in constellation
  static async getObjectsInConstellation(constellation: string) {
    return await DeepSpaceObject.query()
      .where('constellation', constellation)
      .orderBy('magnitude', 'asc')
  }

  // Get bright objects
  static async getBrightObjects(magnitudeLimit: number = 6.0) {
    return await DeepSpaceObject.query()
      .where('magnitude', '<=', magnitudeLimit)
      .orderBy('magnitude', 'asc')
  }

  // Get naked eye objects
  static async getNakedEyeObjects() {
    return await DeepSpaceObject.query()
      .where('isVisibleNakedEye', true)
      .orderBy('magnitude', 'asc')
  }

  // Get nearby objects
  static async getNearbyObjects(maxDistance: number) {
    return await DeepSpaceObject.query()
      .where('distance', '<=', maxDistance)
      .orderBy('distance', 'asc')
  }

  // Get large objects
  static async getLargeObjects(minSize: number = 30) {
    return await DeepSpaceObject.query()
      .where('angularSize', '>=', minSize)
      .orderBy('angularSize', 'desc')
  }

  // Get objects by catalog
  static async getObjectsByCatalog(catalog: string) {
    return await DeepSpaceObject.query()
      .where('catalogName', 'like', `${catalog}%`)
      .orderBy('catalogName', 'asc')
  }

  // Get objects within magnitude range
  static async getObjectsInMagnitudeRange(minMagnitude: number, maxMagnitude: number) {
    return await DeepSpaceObject.query()
      .whereBetween('magnitude', [minMagnitude, maxMagnitude])
      .orderBy('magnitude', 'asc')
  }

  // Get objects within distance range
  static async getObjectsInDistanceRange(minDistance: number, maxDistance: number) {
    return await DeepSpaceObject.query()
      .whereBetween('distance', [minDistance, maxDistance])
      .orderBy('distance', 'asc')
  }

  // Search objects by name or catalog
  static async searchObjects(searchTerm: string) {
    return await DeepSpaceObject.query()
      .where('name', 'like', `%${searchTerm}%`)
      .orWhere('catalogName', 'like', `%${searchTerm}%`)
      .orderBy('magnitude', 'asc')
  }
}