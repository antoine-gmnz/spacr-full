import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Rover from './rover.js'
import Camera from './camera.js'
import { DateTime } from 'luxon'
import { createHash } from 'node:crypto'

interface RoverImageMetadata {
  title?: string
  credits?: string
  originalUrl?: string
  fullSizeUrl?: string
}

export default class OptimizedRoverImage extends BaseModel {
  static table = 'optimized_rover_images'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare imgHash: string

  @column()
  declare sol: number

  @column()
  declare roverId: number

  @column()
  declare cameraCode: string

  @column({
    prepare: (value: RoverImageMetadata) => JSON.stringify(value),
  })
  declare metadata: RoverImageMetadata | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Rover)
  declare rover: BelongsTo<typeof Rover>

  @belongsTo(() => Camera, {
    foreignKey: 'cameraCode'
  })
  declare camera: BelongsTo<typeof Camera>

  // Computed properties for easy access to metadata
  get title(): string {
    return this.metadata?.title || 'Untitled'
  }

  get credits(): string {
    return this.metadata?.credits || 'NASA/JPL-Caltech'
  }

  get originalUrl(): string | null {
    return this.metadata?.originalUrl || null
  }

  get fullSizeUrl(): string | null {
    return this.metadata?.fullSizeUrl || null
  }

  // Helper method to reconstruct image URL from hash
  get imgSrc(): string {
    return this.reconstructImageUrl(this.imgHash, 'rover')
  }

  get imgFullSize(): string {
    return this.reconstructImageUrl(this.imgHash, 'rover', true)
  }

  private reconstructImageUrl(hash: string, type: string, fullSize: boolean = false): string {
    // Reconstruct NASA Mars rover image URLs
    // This is a simplified example - you'd implement based on your URL patterns
    const baseUrl = 'https://mars.nasa.gov/msl-raw-images'
    const size = fullSize ? 'full' : 'large'
    
    // Convert hash back to path structure
    // This would be based on your specific hashing strategy
    return `${baseUrl}/${size}/${hash.substring(0, 2)}/${hash.substring(2, 4)}/${hash}.jpg`
  }

  // Static method to create optimized record from original data
  static async createFromOriginal(originalData: {
    imgSrc: string
    sol: number
    roverId: number
    cameraCode: string
    title?: string
    credits?: string
  }) {
    const imgHash = this.generateImageHash(originalData.imgSrc)
    
    const metadata: RoverImageMetadata = {
      title: originalData.title,
      credits: originalData.credits,
      originalUrl: originalData.imgSrc
    }

    return await this.create({
      imgHash,
      sol: originalData.sol,
      roverId: originalData.roverId,
      cameraCode: originalData.cameraCode,
      metadata
    })
  }

  // Generate MD5 hash from URL for compact storage
  private static generateImageHash(url: string): string {
    return createHash('md5').update(url).digest('hex')
  }

  // Helper method to migrate from old schema
  static async migrateFromRoverImage(oldImage: any) {
    const cameraCode = this.mapCameraNameToCode(oldImage.camera)
    return await this.createFromOriginal({
      imgSrc: oldImage.img_src,
      sol: oldImage.sol,
      roverId: oldImage.roverId,
      cameraCode,
      title: oldImage.title,
      credits: oldImage.credits
    })
  }

  private static mapCameraNameToCode(cameraName: string): string {
    const mapping: Record<string, string> = {
      // Legacy mappings (keep for backward compatibility)
      'Front Hazard Avoidance Camera': 'FHAZ',
      'Rear Hazard Avoidance Camera': 'RHAZ',
      'Mast Camera': 'MAST',
      'Chemistry and Camera Complex': 'CHEMCAM',
      'Mars Hand Lens Imager': 'MAHLI',
      'Mars Descent Imager': 'MARDI',
      'Navigation Camera': 'NAVCAM',
      'Panoramic Camera': 'PANCAM',
      'Miniature Thermal Emission Spectrometer': 'MINITES',
      
      // Updated Perseverance camera mappings
      'Rover Up-Look Camera': 'EDL_RUCAM',
      'Rover Down-Look Camera': 'EDL_RDCAM',
      'Descent Stage Down-Look Camera': 'EDL_DDCAM',
      'Parachute Up-Look Camera A': 'EDL_PUCAM1',
      'Parachute Up-Look Camera B': 'EDL_PUCAM2',
      'Navigation Camera - Left': 'NAVCAM_L',
      'Navigation Camera - Right': 'NAVCAM_R',
      'Mast Camera Zoom - Right': 'MCZ_RIGHT',
      'Mast Camera Zoom - Left': 'MCZ_LEFT',
      'Front Hazard Avoidance Camera - Left': 'FHAZ_LEFT',
      'Front Hazard Avoidance Camera - Right': 'FHAZ_RIGHT',
      'Rear Hazard Avoidance Camera - Left': 'RHAZ_LEFT',
      'Rear Hazard Avoidance Camera - Right': 'RHAZ_RIGHT',
      'MEDA Skycam': 'SKYCAM',
      'SHERLOC WATSON Camera': 'WATSON',
      
      // Direct code mappings (in case they come as codes already)
      'EDL_RUCAM': 'EDL_RUCAM',
      'EDL_RDCAM': 'EDL_RDCAM',
      'EDL_DDCAM': 'EDL_DDCAM',
      'EDL_PUCAM1': 'EDL_PUCAM1',
      'EDL_PUCAM2': 'EDL_PUCAM2',
      'NAVCAM_LEFT': 'NAVCAM_L',
      'NAVCAM_RIGHT': 'NAVCAM_R',
      'MCZ_RIGHT': 'MCZ_RIGHT',
      'MCZ_LEFT': 'MCZ_LEFT',
      'FRONT_HAZCAM_LEFT_A': 'FHAZ_LEFT',
      'FRONT_HAZCAM_RIGHT_A': 'FHAZ_RIGHT',
      'REAR_HAZCAM_LEFT': 'RHAZ_LEFT',
      'REAR_HAZCAM_RIGHT': 'RHAZ_RIGHT',
      'SKYCAM': 'SKYCAM',
      'SHERLOC_WATSON': 'WATSON'
    }
    
    return mapping[cameraName] || cameraName.substring(0, 10).toUpperCase()
  }
}
