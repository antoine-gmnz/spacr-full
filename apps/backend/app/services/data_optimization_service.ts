import OptimizedRoverImage from '#models/optimized_rover_image'
import OptimizedEsaImage from '#models/optimized_esa_image'
import Camera from '#models/camera'
import Constellation from '#models/constellation'
import ImageUrlService from './image_url_service.js'
import logger from '@adonisjs/core/services/logger'

export default class DataOptimizationService {
  /**
   * Migrate existing rover images to optimized schema
   */
  static async migrateRoverImages(batchSize: number = 1000): Promise<void> {
    logger.info('Starting rover images migration to optimized schema...')
    
    // This would query your existing RoverImage table
    // For now, this is a placeholder showing the migration pattern
    
    let offset = 0
    let hasMore = true
    let totalMigrated = 0

    while (hasMore) {
      // Get batch of old images (you'd replace this with actual query)
      const oldImages = await this.getOldRoverImagesBatch(offset, batchSize)
      
      if (oldImages.length === 0) {
        hasMore = false
        break
      }

      // Process batch
      const optimizedImages = []
      
      for (const oldImage of oldImages) {
        try {
          const optimized = await this.convertRoverImageToOptimized(oldImage)
          optimizedImages.push(optimized)
        } catch (error) {
          logger.error(`Failed to migrate rover image ${oldImage.id}:`, error)
        }
      }

      // Batch insert optimized images
      if (optimizedImages.length > 0) {
        await OptimizedRoverImage.createMany(optimizedImages)
        totalMigrated += optimizedImages.length
        logger.info(`Migrated ${totalMigrated} rover images so far...`)
      }

      offset += batchSize
    }

    logger.info(`Completed rover images migration: ${totalMigrated} images migrated`)
  }

  /**
   * Migrate existing ESA images to optimized schema
   */
  static async migrateEsaImages(batchSize: number = 1000): Promise<void> {
    logger.info('Starting ESA images migration to optimized schema...')
    
    let offset = 0
    let hasMore = true
    let totalMigrated = 0

    while (hasMore) {
      // Get batch of old images (you'd replace this with actual query)
      const oldImages = await this.getOldEsaImagesBatch(offset, batchSize)
      
      if (oldImages.length === 0) {
        hasMore = false
        break
      }

      // Process batch
      const optimizedImages = []
      
      for (const oldImage of oldImages) {
        try {
          const optimized = await this.convertEsaImageToOptimized(oldImage)
          optimizedImages.push(optimized)
        } catch (error) {
          logger.error(`Failed to migrate ESA image ${oldImage.id}:`, error)
        }
      }

      // Batch insert optimized images
      if (optimizedImages.length > 0) {
        await OptimizedEsaImage.createMany(optimizedImages)
        totalMigrated += optimizedImages.length
        logger.info(`Migrated ${totalMigrated} ESA images so far...`)
      }

      offset += batchSize
    }

    logger.info(`Completed ESA images migration: ${totalMigrated} images migrated`)
  }

  /**
   * Convert old rover image record to optimized format
   */
  private static async convertRoverImageToOptimized(oldImage: any): Promise<Partial<OptimizedRoverImage>> {
    const imgHash = ImageUrlService.generateImageHash(oldImage.img_src)
    const cameraCode = await this.getCameraCode(oldImage.camera)
    
    const metadata = {
      title: oldImage.title,
      credits: oldImage.credits,
      originalUrl: oldImage.img_src
    }

    return {
      imgHash,
      sol: oldImage.sol,
      roverId: oldImage.roverId,
      cameraCode,
      metadata
    }
  }

  /**
   * Convert old ESA image record to optimized format
   */
  private static async convertEsaImageToOptimized(oldImage: any): Promise<Partial<OptimizedEsaImage>> {
    const imgHash = ImageUrlService.generateImageHash(oldImage.img_src)
    const titleShort = oldImage.title?.substring(0, 100) || 'Untitled'
    const constellationCode = await this.getConstellationCode(oldImage.constellation)
    const releaseYear = this.extractYear(oldImage.release_date)
    const type = this.mapImageType(oldImage.type)
    
    const metadata = {
      fullTitle: oldImage.title,
      credits: oldImage.credits,
      releaseDate: oldImage.release_date,
      originalUrl: oldImage.img_src,
      fullSizeUrl: oldImage.img_full_size
    }

    return {
      esaId: oldImage.esa_id,
      imgHash,
      titleShort,
      constellationCode,
      fov: oldImage.fov?.substring(0, 20) || null,
      releaseYear,
      type,
      metadata
    }
  }

  /**
   * Get or create camera code from camera name
   */
  private static async getCameraCode(cameraName: string): Promise<string> {
    if (!cameraName) return 'UNKNOWN'

    // Try to find existing camera
    let camera = await Camera.find(cameraName.substring(0, 10).toUpperCase())
    
    if (!camera) {
      // Create new camera entry
      const code = cameraName.substring(0, 10).toUpperCase()
      camera = await Camera.create({
        code,
        fullName: cameraName,
        description: `Auto-created from migration: ${cameraName}`
      })
    }

    return camera.code
  }

  /**
   * Get or create constellation code from constellation name
   */
  private static async getConstellationCode(constellationName?: string): Promise<string | null> {
    if (!constellationName) return null

    // Try to find existing constellation
    const code = constellationName.substring(0, 20).toUpperCase()
    let constellation = await Constellation.find(code)
    
    if (!constellation) {
      // Create new constellation entry
      constellation = await Constellation.create({
        code,
        fullName: constellationName,
        description: `Auto-created from migration: ${constellationName}`
      })
    }

    return constellation.code
  }

  /**
   * Extract year from date string
   */
  private static extractYear(dateString?: string): number | null {
    if (!dateString) return null
    
    const yearMatch = dateString.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }

  /**
   * Map old image type to new enum
   */
  private static mapImageType(oldType?: string): 'JWST' | 'HUBBLE' | 'OTHER' {
    if (!oldType) return 'OTHER'
    
    if (oldType.includes('JAMES_WEBB') || oldType.includes('JWST')) return 'JWST'
    if (oldType.includes('HUBBLE')) return 'HUBBLE'
    return 'OTHER'
  }

  /**
   * Get batch of old rover images (placeholder - implement with your actual table)
   */
  private static async getOldRoverImagesBatch(offset: number, limit: number): Promise<any[]> {
    // This would query your existing rover_images table
    // For now, returning empty array as placeholder
    return []
  }

  /**
   * Get batch of old ESA images (placeholder - implement with your actual table)
   */
  private static async getOldEsaImagesBatch(offset: number, limit: number): Promise<any[]> {
    // This would query your existing esa_space_telescope_images table
    // For now, returning empty array as placeholder
    return []
  }

  /**
   * Calculate storage savings from optimization
   */
  static async calculateStorageSavings(): Promise<{
    oldSize: number
    newSize: number
    savings: number
    savingsPercent: number
  }> {
    // Estimate old storage size
    const roverCount = await OptimizedRoverImage.query().count('* as total')
    const esaCount = await OptimizedEsaImage.query().count('* as total')
    
    const totalImages = Number(roverCount[0]) + Number(esaCount[0])
    
    // Rough estimates based on average field sizes
    const oldAverageSize = 500 // bytes per record (with long URLs and text)
    const newAverageSize = 100 // bytes per record (optimized)
    
    const oldSize = totalImages * oldAverageSize
    const newSize = totalImages * newAverageSize
    const savings = oldSize - newSize
    const savingsPercent = (savings / oldSize) * 100

    return {
      oldSize,
      newSize,
      savings,
      savingsPercent
    }
  }

  /**
   * Seed lookup tables with common values
   */
  static async seedLookupTables(): Promise<void> {
    logger.info('Seeding lookup tables...')
    
    await Camera.seedCommonCameras()
    await Constellation.seedCommonConstellations()
    
    logger.info('Lookup tables seeded successfully')
  }

  /**
   * Validate optimized data integrity
   */
  static async validateDataIntegrity(): Promise<{
    roverImagesValid: number
    roverImagesInvalid: number
    esaImagesValid: number
    esaImagesInvalid: number
  }> {
    logger.info('Validating optimized data integrity...')
    
    let roverImagesValid = 0
    let roverImagesInvalid = 0
    let esaImagesValid = 0
    let esaImagesInvalid = 0

    // Validate rover images
    const roverImages = await OptimizedRoverImage.all()
    for (const image of roverImages) {
      if (image.imgHash && image.sol >= 0 && image.roverId && image.cameraCode) {
        roverImagesValid++
      } else {
        roverImagesInvalid++
        logger.warn(`Invalid rover image record: ID ${image.id}`)
      }
    }

    // Validate ESA images
    const esaImages = await OptimizedEsaImage.all()
    for (const image of esaImages) {
      if (image.esaId && image.imgHash && image.titleShort && image.type) {
        esaImagesValid++
      } else {
        esaImagesInvalid++
        logger.warn(`Invalid ESA image record: ID ${image.id}`)
      }
    }

    logger.info('Data integrity validation completed', {
      roverImagesValid,
      roverImagesInvalid,
      esaImagesValid,
      esaImagesInvalid
    })

    return {
      roverImagesValid,
      roverImagesInvalid,
      esaImagesValid,
      esaImagesInvalid
    }
  }
}
