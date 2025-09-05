import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Constellation from './constellation.js'
import { DateTime } from 'luxon'
import { createHash } from 'crypto'

export type EsaImageType = 'JWST' | 'HUBBLE' | 'OTHER'

export default class OptimizedEsaImage extends BaseModel {
  static table = 'optimized_esa_images'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare esaId: string

  @column()
  declare imgHash: string

  @column()
  declare title: string

  @column()
  declare constellationCode: string | null

  @column()
  declare fov: string | null

  @column()
  declare releaseDate: string | null

  @column()
  declare credits: string | null

  @column()
  declare type: EsaImageType

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Constellation, {
    foreignKey: 'constellationCode'
  })
  declare constellation: BelongsTo<typeof Constellation>

  // Helper method to reconstruct image URLs from hash
  get imgSrc(): string {
    return OptimizedEsaImage.reconstructImageUrl(this.imgHash, this.type, false)
  }

  get imgFullSize(): string {
    return OptimizedEsaImage.reconstructImageUrl(this.imgHash, this.type, true)
  }

  static generateImageHash(url: string): string {
    return createHash('md5').update(url).digest('hex')
  }

  static reconstructImageUrl(esaId: string, type: EsaImageType, fullSize: boolean = false): string {
    const baseUrls = {
      JWST: fullSize 
        ? 'https://cdn.esawebb.org/archives/images/publicationjpg'
        : 'https://cdn.esawebb.org/archives/images/large',
      HUBBLE: fullSize
        ? 'https://cdn.spacetelescope.org/archives/images/publicationjpg' 
        : 'https://cdn.spacetelescope.org/archives/images/large',
      OTHER: fullSize
        ? 'https://cdn.esa.int/archives/images/publicationjpg'
        : 'https://cdn.esa.int/archives/images/large'
    }

    const baseUrl = baseUrls[type]
    
    // For ESA images, the URL pattern is typically: baseUrl/esaId.jpg
    return `${baseUrl}/${esaId}.jpg`
  }

  // Static method to create optimized record from original data
  static async createFromOriginal(originalData: {
    esaId: string
    imgSrc: string
    imgFullSize?: string
    title: string
    credits?: string
    constellation?: string
    fov?: string
    releaseDate?: string
    type: EsaImageType
  }) {
    const imgHash = this.generateImageHash(originalData.imgSrc)
    const titleShort = originalData.title.substring(0, 100)
    const constellationCode = this.mapConstellationNameToCode(originalData.constellation)
    const releaseYear = this.extractYearFromDate(originalData.releaseDate)

    return await this.create({
      esaId: originalData.esaId,
      imgHash,
      titleShort,
      constellationCode,
      fov: originalData.fov?.substring(0, 20) || null,
      releaseYear,
      type: originalData.type,
    })
  }

  // Extract year from various date formats
  private static extractYearFromDate(dateString?: string): number | null {
    if (!dateString) return null
    
    // Try to extract 4-digit year from various formats
    const yearMatch = dateString.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  // Map constellation names to codes
  private static mapConstellationNameToCode(constellationName?: string): string | null {
    if (!constellationName) return null
    
    const mapping: Record<string, string> = {
      'Orion': 'ORI',
      'Cassiopeia': 'CAS',
      'Ursa Major': 'UMA',
      'Ursa Minor': 'UMI',
      'Draco': 'DRA',
      'Cygnus': 'CYG',
      'Aquila': 'AQL',
      'Lyra': 'LYR',
      'Vulpecula': 'VUL',
      'Sagittarius': 'SGR',
      'Scorpius': 'SCO',
      'Centaurus': 'CEN',
      'Carina': 'CAR',
      'Vela': 'VEL',
      'Puppis': 'PUP'
    }
    
    return mapping[constellationName] || constellationName.substring(0, 20).toUpperCase()
  }

  // Helper method to migrate from old schema
  static async migrateFromESAImage(oldImage: any) {
    const type: EsaImageType = oldImage.type === 'JAMES_WEBB' ? 'JWST' : 
                               oldImage.type === 'HUBBLE' ? 'HUBBLE' : 'OTHER'
    
    return await this.createFromOriginal({
      esaId: oldImage.esa_id,
      imgSrc: oldImage.img_src,
      imgFullSize: oldImage.img_full_size,
      title: oldImage.title,
      credits: oldImage.credits,
      constellation: oldImage.constellation,
      fov: oldImage.fov,
      releaseDate: oldImage.release_date,
      type
    })
  }
}
