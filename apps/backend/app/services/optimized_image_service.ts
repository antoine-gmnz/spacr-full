import OptimizedRoverImage from '#models/optimized_rover_image'
import OptimizedEsaImage from '#models/optimized_esa_image'
import Camera from '#models/camera'
import Constellation from '#models/constellation'
import ImageUrlService from './image_url_service.js'
import type { EsaImageType } from '#models/optimized_esa_image'

export default class OptimizedImageService {
  /**
   * Get paginated rover images with reconstructed URLs
   */
  async getRoverImages(page: number = 1, limit: number = 20, filters?: {
    roverId?: number
    cameraCode?: string
    solMin?: number
    solMax?: number
  }) {
    let query = OptimizedRoverImage.query()
      .preload('rover')
      .preload('camera')
      .orderBy('sol', 'desc')

    if (filters) {
      if (filters.roverId) query = query.where('roverId', filters.roverId)
      if (filters.cameraCode) query = query.where('cameraCode', filters.cameraCode)
      if (filters.solMin) query = query.where('sol', '>=', filters.solMin)
      if (filters.solMax) query = query.where('sol', '<=', filters.solMax)
    }

    const result = await query.paginate(page, limit)

    // Transform data to include reconstructed URLs
    const transformedData = result.toJSON()
    transformedData.data = transformedData.data.map((image: any) => ({
      ...image,
      imgSrc: ImageUrlService.reconstructRoverImageUrl(image.imgHash),
      imgFullSize: ImageUrlService.reconstructRoverImageUrl(image.imgHash, true),
      title: image.metadata?.title || 'Untitled',
      credits: image.metadata?.credits || 'NASA/JPL-Caltech'
    }))

    return transformedData
  }

  /**
   * Get paginated ESA telescope images with reconstructed URLs
   */
  async getEsaImages(page: number = 1, limit: number = 20, filters?: {
    type?: EsaImageType
    constellationCode?: string
    releaseYear?: number
    yearMin?: number
    yearMax?: number
  }) {
    let query = OptimizedEsaImage.query()
      .preload('constellation')
      .orderBy('releaseYear', 'desc')
      .orderBy('id', 'desc')

    if (filters) {
      if (filters.type) query = query.where('type', filters.type)
      if (filters.constellationCode) query = query.where('constellationCode', filters.constellationCode)
      if (filters.releaseYear) query = query.where('releaseYear', filters.releaseYear)
      if (filters.yearMin) query = query.where('releaseYear', '>=', filters.yearMin)
      if (filters.yearMax) query = query.where('releaseYear', '<=', filters.yearMax)
    }

    const result = await query.paginate(page, limit)

    // Transform data to include reconstructed URLs
    const transformedData = result.toJSON()
    transformedData.data = transformedData.data.map((image: any) => ({
      ...image,
      imgSrc: ImageUrlService.reconstructEsaImageUrl(image.esaId, image.type),
      imgFullSize: ImageUrlService.reconstructEsaImageUrl(image.esaId, image.type, true),
      title: image.metadata?.fullTitle || image.titleShort,
      credits: image.metadata?.credits || 'ESA/Webb, ESA/Hubble & NASA',
      releaseDate: image.metadata?.releaseDate,
      constellation: image.constellation?.fullName || null
    }))

    return transformedData
  }

  /**
   * Get single rover image with full details
   */
  async getRoverImage(id: number) {
    const image = await OptimizedRoverImage.query()
      .where('id', id)
      .preload('rover')
      .preload('camera')
      .firstOrFail()

    return {
      ...image.toJSON(),
      imgSrc: ImageUrlService.reconstructRoverImageUrl(image.imgHash),
      imgFullSize: ImageUrlService.reconstructRoverImageUrl(image.imgHash, true),
      title: image.metadata?.title || 'Untitled',
      credits: image.metadata?.credits || 'NASA/JPL-Caltech'
    }
  }

  /**
   * Get single ESA image with full details
   */
  async getEsaImage(id: number) {
    const image = await OptimizedEsaImage.query()
      .where('id', id)
      .preload('constellation')
      .firstOrFail()

    return {
      ...image.toJSON(),
      imgSrc: ImageUrlService.reconstructEsaImageUrl(image.esaId, image.type),
      imgFullSize: ImageUrlService.reconstructEsaImageUrl(image.esaId, image.type, true),
      title: image.metadata?.fullTitle || image.titleShort,
      credits: image.metadata?.credits || 'ESA/Webb, ESA/Hubble & NASA',
      releaseDate: image.metadata?.releaseDate,
      constellation: image.constellation?.fullName || null
    }
  }

  /**
   * Search rover images by text
   */
  async searchRoverImages(searchTerm: string, page: number = 1, limit: number = 20) {
    const result = await OptimizedRoverImage.query()
      .whereRaw("metadata->>'title' ILIKE ?", [`%${searchTerm}%`])
      .orWhereRaw("metadata->>'credits' ILIKE ?", [`%${searchTerm}%`])
      .preload('rover')
      .preload('camera')
      .orderBy('sol', 'desc')
      .paginate(page, limit)

    // Transform data to include reconstructed URLs
    const transformedData = result.toJSON()
    transformedData.data = transformedData.data.map((image: any) => ({
      ...image,
      imgSrc: ImageUrlService.reconstructRoverImageUrl(image.imgHash),
      imgFullSize: ImageUrlService.reconstructRoverImageUrl(image.imgHash, true),
      title: image.metadata?.title || 'Untitled',
      credits: image.metadata?.credits || 'NASA/JPL-Caltech'
    }))

    return transformedData
  }

  /**
   * Search ESA images by text
   */
  async searchEsaImages(searchTerm: string, page: number = 1, limit: number = 20) {
    const result = await OptimizedEsaImage.query()
      .where('titleShort', 'ILIKE', `%${searchTerm}%`)
      .orWhereRaw("metadata->>'fullTitle' ILIKE ?", [`%${searchTerm}%`])
      .orWhereRaw("metadata->>'credits' ILIKE ?", [`%${searchTerm}%`])
      .preload('constellation')
      .orderBy('releaseYear', 'desc')
      .orderBy('id', 'desc')
      .paginate(page, limit)

    // Transform data to include reconstructed URLs
    const transformedData = result.toJSON()
    transformedData.data = transformedData.data.map((image: any) => ({
      ...image,
      imgSrc: ImageUrlService.reconstructEsaImageUrl(image.esaId, image.type),
      imgFullSize: ImageUrlService.reconstructEsaImageUrl(image.esaId, image.type, true),
      title: image.metadata?.fullTitle || image.titleShort,
      credits: image.metadata?.credits || 'ESA/Webb, ESA/Hubble & NASA',
      releaseDate: image.metadata?.releaseDate,
      constellation: image.constellation?.fullName || null
    }))

    return transformedData
  }

  /**
   * Get statistics about stored images
   */
  async getImageStats() {
    const [roverStats, esaStats] = await Promise.all([
      OptimizedRoverImage.query()
        .select('rover_id')
        .count('* as total')
        .groupBy('rover_id'),
      OptimizedEsaImage.query()
        .select('type')
        .count('* as total')
        .groupBy('type')
    ])

    const [totalRover] = await OptimizedRoverImage.query().count('* as total')
    const [totalEsa] = await OptimizedEsaImage.query().count('* as total')

    return {
      total: {
        rover: Number(totalRover.total),
        esa: Number(totalEsa.total),
        combined: Number(totalRover.total) + Number(totalEsa.total)
      },
      byRover: roverStats.map(stat => ({
        roverId: stat.rover_id,
        count: Number(stat.total)
      })),
      byType: esaStats.map(stat => ({
        type: stat.type,
        count: Number(stat.total)
      }))
    }
  }

  /**
   * Get available cameras
   */
  async getCameras() {
    return await Camera.all()
  }

  /**
   * Get available constellations
   */
  async getConstellations() {
    return await Constellation.all()
  }

  /**
   * Create new rover image (optimized format)
   */
  async createRoverImage(data: {
    imgSrc: string
    sol: number
    roverId: number
    cameraCode: string
    title?: string
    credits?: string
  }) {
    const imgHash = ImageUrlService.generateImageHash(data.imgSrc)
    
    const metadata = {
      title: data.title,
      credits: data.credits,
      originalUrl: data.imgSrc
    }

    return await OptimizedRoverImage.create({
      imgHash,
      sol: data.sol,
      roverId: data.roverId,
      cameraCode: data.cameraCode,
      metadata
    })
  }

  /**
   * Create new ESA image (optimized format)
   */
  async createEsaImage(data: {
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
    const imgHash = ImageUrlService.generateImageHash(data.imgSrc)
    const titleShort = data.title.substring(0, 100)
    const constellationCode = await this.getOrCreateConstellationCode(data.constellation)
    const releaseYear = this.extractYear(data.releaseDate)
    
    const metadata = {
      fullTitle: data.title,
      credits: data.credits,
      releaseDate: data.releaseDate,
      originalUrl: data.imgSrc,
      fullSizeUrl: data.imgFullSize
    }

    return await OptimizedEsaImage.create({
      esaId: data.esaId,
      imgHash,
      titleShort,
      constellationCode,
      fov: data.fov?.substring(0, 20) || null,
      releaseYear,
      type: data.type,
      metadata
    })
  }

  /**
   * Batch create rover images for efficient scraping
   */
  async batchCreateRoverImages(images: Array<{
    imgSrc: string
    sol: number
    roverId: number
    cameraCode: string
    title?: string
    credits?: string
  }>) {
    const optimizedImages = images.map(image => ({
      imgHash: ImageUrlService.generateImageHash(image.imgSrc),
      sol: image.sol,
      roverId: image.roverId,
      cameraCode: image.cameraCode,
      metadata: {
        title: image.title,
        credits: image.credits,
        originalUrl: image.imgSrc
      }
    }))

    return await OptimizedRoverImage.createMany(optimizedImages)
  }

  /**
   * Batch create ESA images for efficient scraping
   */
  async batchCreateEsaImages(images: Array<{
    esaId: string
    imgSrc: string
    imgFullSize?: string
    title: string
    credits?: string
    constellation?: string
    fov?: string
    releaseDate?: string
    type: EsaImageType
  }>) {
    const optimizedImages = await Promise.all(
      images.map(async (image) => ({
        esaId: image.esaId,
        imgHash: ImageUrlService.generateImageHash(image.imgSrc),
        titleShort: image.title.substring(0, 100),
        constellationCode: await this.getOrCreateConstellationCode(image.constellation),
        fov: image.fov?.substring(0, 20) || null,
        releaseYear: this.extractYear(image.releaseDate),
        type: image.type,
        metadata: {
          fullTitle: image.title,
          credits: image.credits,
          releaseDate: image.releaseDate,
          originalUrl: image.imgSrc,
          fullSizeUrl: image.imgFullSize
        }
      }))
    )

    return await OptimizedEsaImage.createMany(optimizedImages)
  }

  /**
   * Helper: Get or create constellation code
   */
  private async getOrCreateConstellationCode(constellationName?: string): Promise<string | null> {
    if (!constellationName) return null

    const code = constellationName.substring(0, 20).toUpperCase()
    let constellation = await Constellation.find(code)
    
    if (!constellation) {
      constellation = await Constellation.create({
        code,
        fullName: constellationName,
        description: `Auto-created: ${constellationName}`
      })
    }

    return constellation.code
  }

  /**
   * Helper: Extract year from date string
   */
  private extractYear(dateString?: string): number | null {
    if (!dateString) return null
    
    const yearMatch = dateString.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }
}
