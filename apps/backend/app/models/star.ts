import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Star extends BaseModel {
  static table = 'stars'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column()
  declare bayerDesignation: string | null

  @column()
  declare ra: number | null // Right Ascension in degrees

  @column()
  declare dec: number | null // Declination in degrees

  @column()
  declare magnitude: number | null // Apparent magnitude

  @column()
  declare spectralType: string | null

  @column()
  declare distanceLog: number | null // log10(distance in light years) - astronomical precision

  @column()
  declare parallax: number | null // in arcseconds

  @column()
  declare properMotionRa: number | null // in arcseconds/year

  @column()
  declare properMotionDec: number | null // in arcseconds/year

  @column()
  declare luminosityLog: number | null // log10(solar luminosities) - astronomical precision

  @column()
  declare temperatureLog: number | null // log10(temperature in K) - astronomical precision

  @column()
  declare colorIndex: string | null // B-V color index

  @column()
  declare isVariable: boolean

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper methods for logarithmic conversions
  get distance(): number | null {
    return this.distanceLog ? Math.pow(10, this.distanceLog) : null
  }

  get luminosity(): number | null {
    return this.luminosityLog ? Math.pow(10, this.luminosityLog) : null
  }

  get temperature(): number | null {
    return this.temperatureLog ? Math.pow(10, this.temperatureLog) : null
  }

  // Helper methods
  get isBright(): boolean {
    return this.magnitude !== null && this.magnitude <= 2.0
  }

  get isVisibleNakedEye(): boolean {
    return this.magnitude !== null && this.magnitude <= 6.0
  }

  get isRedGiant(): boolean {
    return this.spectralType !== null && 
           (this.spectralType.includes('M') || this.spectralType.includes('K')) &&
           this.luminosity !== null && this.luminosity > 100
  }

  get isWhiteDwarf(): boolean {
    return this.spectralType !== null && this.spectralType.includes('D')
  }

  get isNeutronStar(): boolean {
    return this.spectralType !== null && this.spectralType.includes('Q')
  }

  // Get absolute magnitude
  get absoluteMagnitude(): number | null {
    if (this.magnitude === null || this.distance === null) return null
    
    // M = m - 5 * log10(d/10)
    // where M is absolute magnitude, m is apparent magnitude, d is distance in parsecs
    const distanceInParsecs = this.distance / 3.26156 // Convert light years to parsecs
    return this.magnitude - 5 * Math.log10(distanceInParsecs / 10)
  }

  // Get star color based on spectral type
  get starColor(): string {
    if (!this.spectralType) return '#FFFFFF'
    
    const spectralClass = this.spectralType.charAt(0)
    const colorMap: Record<string, string> = {
      'O': '#9BB0FF', // Blue
      'B': '#AABFFF', // Blue-white
      'A': '#CAD7FF', // White
      'F': '#F8F7FF', // Yellow-white
      'G': '#FFF4EA', // Yellow
      'K': '#FFD2A1', // Orange
      'M': '#FFCC6F', // Red-orange
      'D': '#FFFFFF', // White dwarf
      'Q': '#FF0000'  // Neutron star
    }
    
    return colorMap[spectralClass] || '#FFFFFF'
  }

  // Get star size category
  get sizeCategory(): string {
    if (!this.spectralType || this.spectralType.length < 2) return 'Unknown'
    
    const sizeClass = this.spectralType.charAt(1)
    const sizeMap: Record<string, string> = {
      '0': 'Hypergiant',
      'Ia': 'Bright Supergiant',
      'Ib': 'Supergiant',
      'II': 'Bright Giant',
      'III': 'Giant',
      'IV': 'Subgiant',
      'V': 'Main Sequence',
      'VI': 'Subdwarf',
      'VII': 'White Dwarf'
    }
    
    return sizeMap[sizeClass] || 'Unknown'
  }

  // Get star age estimate (very approximate)
  get estimatedAge(): number | null {
    if (!this.spectralType || !this.luminosity) return null
    
    const spectralClass = this.spectralType.charAt(0)
    const ageMap: Record<string, number> = {
      'O': 0.001, // 1 million years
      'B': 0.01,  // 10 million years
      'A': 0.1,   // 100 million years
      'F': 1,     // 1 billion years
      'G': 5,     // 5 billion years
      'K': 10,    // 10 billion years
      'M': 50     // 50 billion years
    }
    
    return ageMap[spectralClass] || null
  }

  // Get distance in parsecs
  get distanceInParsecs(): number | null {
    return this.distance ? this.distance / 3.26156 : null
  }

  // Get distance in astronomical units
  get distanceInAU(): number | null {
    return this.distance ? this.distance * 63241.1 : null // 1 ly = 63241.1 AU
  }

  // Static methods for data seeding
  static async seedBrightStars() {
    const brightStars = [
      {
        name: 'Sirius',
        bayerDesignation: 'α CMa',
        ra: 101.2874,
        dec: -16.7161,
        magnitude: -1.46,
        spectralType: 'A1V',
        distanceLog: 0.934, // log10(8.6)
        parallax: 0.379,
        properMotionRa: -0.546,
        properMotionDec: -1.223,
        luminosityLog: 1.405, // log10(25.4)
        temperatureLog: 3.997, // log10(9940)
        colorIndex: '0.009',
        isVariable: false,
        description: 'The brightest star in the night sky, also known as the Dog Star.'
      },
      {
        name: 'Canopus',
        bayerDesignation: 'α Car',
        ra: 95.9880,
        dec: -52.6957,
        magnitude: -0.74,
        spectralType: 'A9II',
        distanceLog: 2.491, // log10(310)
        parallax: 0.010,
        properMotionRa: 0.019,
        properMotionDec: 0.023,
        luminosityLog: 4.029, // log10(10700)
        temperatureLog: 3.866, // log10(7350)
        colorIndex: '0.155',
        isVariable: false,
        description: 'The second brightest star in the night sky, located in the constellation Carina.'
      },
      {
        name: 'Arcturus',
        bayerDesignation: 'α Boo',
        ra: 213.9153,
        dec: 19.1824,
        magnitude: -0.05,
        spectralType: 'K1.5III',
        distanceLog: 1.565, // log10(36.7)
        parallax: 0.089,
        properMotionRa: -1.093,
        properMotionDec: -1.999,
        luminosityLog: 2.230, // log10(170)
        temperatureLog: 3.632, // log10(4286)
        colorIndex: '1.227',
        isVariable: false,
        description: 'A red giant star in the constellation Boötes, the fourth brightest star in the night sky.'
      },
      {
        name: 'Vega',
        bayerDesignation: 'α Lyr',
        ra: 279.2347,
        dec: 38.7836,
        magnitude: 0.03,
        spectralType: 'A0V',
        distanceLog: 1.398, // log10(25.0)
        parallax: 0.130,
        properMotionRa: 0.201,
        properMotionDec: 0.287,
        luminosityLog: 1.603, // log10(40.12)
        temperatureLog: 3.982, // log10(9602)
        colorIndex: '0.000',
        isVariable: false,
        description: 'One of the brightest stars in the northern hemisphere, part of the Summer Triangle.'
      },
      {
        name: 'Capella',
        bayerDesignation: 'α Aur',
        ra: 79.1723,
        dec: 45.9980,
        magnitude: 0.08,
        spectralType: 'G8III',
        distanceLog: 1.632, // log10(42.9)
        parallax: 0.077,
        properMotionRa: 0.430,
        properMotionDec: -0.427,
        luminosityLog: 1.896, // log10(78.7)
        temperatureLog: 3.696, // log10(4970)
        colorIndex: '0.796',
        isVariable: false,
        description: 'A binary star system in the constellation Auriga, the sixth brightest star in the night sky.'
      }
    ]

    for (const star of brightStars) {
      await Star.updateOrCreate(
        { name: star.name },
        star
      )
    }
  }

  // Get stars within a certain magnitude limit
  static async getBrightStars(limit: number = 6.0) {
    return await Star.query()
      .where('magnitude', '<=', limit)
      .orderBy('magnitude', 'asc')
  }

  // Get stars within a constellation
  static async getStarsInConstellation(constellationAbbr: string) {
    // This would need constellation relationship
    return await Star.query()
      .where('bayerDesignation', 'like', `% ${constellationAbbr}`)
      .orderBy('magnitude', 'asc')
  }

  // Get stars within a certain distance
  static async getNearbyStars(maxDistance: number) {
    return await Star.query()
      .where('distance', '<=', maxDistance)
      .orderBy('distance', 'asc')
  }
}