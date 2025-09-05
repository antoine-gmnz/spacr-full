import OptimizedRoverImage from '#models/optimized_rover_image'
import Rover from '#models/rover'
import Camera from '#models/camera'
import logger from '@adonisjs/core/services/logger'

type NasaPhoto = {
  id: number
  sol: number
  camera: { id: number; name: string; rover_id: number; full_name: string }
  img_src: string
  earth_date: string
  rover: { id: number; name: string }
}

export default class NasaRoverScrapingService {
  private readonly apiBase = 'https://api.nasa.gov/mars-photos/api/v1'

  private async ensureReferences(): Promise<void> {
    // Ensure common cameras exist (idempotent)
    await Camera.seedCommonCameras()
  }

  public async scrapeRange(params: {
    rover: string
    beginSol: number
    endSol: number
    camera?: string
    apiKey: string
  }): Promise<{ inserted: number; skipped: number }> {
    const { rover, beginSol, endSol, camera, apiKey } = params

    if (beginSol > endSol) {
      throw new Error('beginSol must be <= endSol')
    }

    await this.ensureReferences()

    const roverRecord = await Rover.query().where('name', rover).first()
    if (!roverRecord) {
      throw new Error(`Rover not found in DB: ${rover}`)
    }

    let inserted = 0
    let skipped = 0

    for (let sol = beginSol; sol <= endSol; sol++) {
      try {
        const search = new URLSearchParams()
        search.set('sol', String(sol))
        search.set('api_key', apiKey)
        if (camera) search.set('camera', camera)

        const url = `${this.apiBase}/rovers/${encodeURIComponent(rover)}/photos?${search.toString()}`
        const res = await fetch(url)
        if (!res.ok) {
          logger.warn(`NASA API returned ${res.status} for ${url}`)
          continue
        }
        const data = (await res.json()) as { photos: NasaPhoto[] }
        for (const photo of data.photos) {
          try {
            const cameraCode = await this.getCameraCode(photo.camera?.name || camera || 'UNKNOWN')
            await OptimizedRoverImage.firstOrCreate(
              { imgHash: (OptimizedRoverImage as any).generateImageHash(photo.img_src) },
              {
                imgHash: (OptimizedRoverImage as any).generateImageHash(photo.img_src),
                sol: photo.sol,
                roverId: roverRecord.id,
                cameraCode: cameraCode,
                metadata: {
                  title: photo.camera?.full_name,
                  credits: 'NASA/JPL-Caltech',
                  originalUrl: photo.img_src,
                },
              }
            )
            inserted++
          } catch (e) {
            console.log(e)
            // Likely duplicate due to unique hash
            skipped++
          }
        }
      } catch (error) {
        logger.error('Failed scraping sol %d: %o', sol, error)
      }
    }

    logger.info('Rover scraping finished. inserted=%d skipped=%d', inserted, skipped)
    return { inserted, skipped }
  }

  private async getCameraCode(cameraName: string): Promise<string> {
    switch (cameraName) {
      case 'NAVCAM_LEFT':
        return 'NAVCAM_L'
      case 'NAVCAM_RIGHT':
        return 'NAVCAM_R'
      case 'FRONT_HAZCAM_LEFT_A':
        return 'FHAZ_LEFT'
      case 'FRONT_HAZCAM_RIGHT_A':
        return 'FHAZ_RIGHT'
      case 'REAR_HAZCAM_LEFT':
        return 'RHAZ_LEFT'
      case 'REAR_HAZCAM_RIGHT':
      default:
        return cameraName
    }
  }
}


