import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Constellation from './constellation.js'
import { DateTime } from 'luxon'

interface EsaImageMetadata {
  fullTitle?: string
  credits?: string
  releaseDate?: string
  originalUrl?: string
  fullSizeUrl?: string
}

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
  declare titleShort: string

  @column()
  declare constellationCode: string | null

  @column()
  declare fov: string | null

  @column()
  declare releaseYear: number | null

  @column()
  declare type: EsaImageType

  @column({
    prepare: (value: EsaImageMetadata) => JSON.stringify(value),
    consume: (value: string) => value ? JSON.parse(value) : null
  })
  declare metadata: EsaImageMetadata | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Constellation, {
    foreignKey: 'constellationCode'
  })
  declare constellation: BelongsTo<typeof Constellation>

  // Computed properties for easy access to metadata
  get title(): string {
    return this.metadata?.fullTitle || this.titleShort
  }

  get credits(): string {
    return this.metadata?.credits || 'ESA/Webb, ESA/Hubble & NASA'
  }

  get releaseDate(): string | null {
    return this.metadata?.releaseDate || null
  }

  get originalUrl(): string | null {
    return this.metadata?.originalUrl || null
  }

  get fullSizeUrl(): string | null {
    return this.metadata?.fullSizeUrl || null
  }

  // Helper method to reconstruct image URLs from hash
  get imgSrc(): string {
    return this.reconstructImageUrl(this.imgHash, this.type, false)
  }

  get imgFullSize(): string {
    return this.reconstructImageUrl(this.imgHash, this.type, true)
  }

  private reconstructImageUrl(hash: string, type: EsaImageType, fullSize: boolean = false): string {
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
    return `${baseUrl}/${this.esaId}.jpg`
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
    
    const metadata: EsaImageMetadata = {
      fullTitle: originalData.title,
      credits: originalData.credits,
      releaseDate: originalData.releaseDate,
      originalUrl: originalData.imgSrc,
      fullSizeUrl: originalData.imgFullSize
    }

    return await this.create({
      esaId: originalData.esaId,
      imgHash,
      titleShort,
      constellationCode,
      fov: originalData.fov?.substring(0, 20) || null,
      releaseYear,
      type: originalData.type,
      metadata
    })
  }

  // Generate MD5 hash from URL for compact storage
  private static generateImageHash(url: string): string {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(url).digest('hex')
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
