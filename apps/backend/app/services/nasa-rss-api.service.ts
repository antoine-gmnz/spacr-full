import RoverImage from '#models/rover-image'
import Rover from '#models/rover'
import logger from '@adonisjs/core/services/logger'

type NasaRssFeedResponse = {
  per_page: number
  total_results: number
  type: string
  page: number
  mission: string
  total_images: number
  images: NasaRssFeedResponseImage[]
}

type NasaRssFeedResponseImage = {
  extended: {
    mastAz: string
    mastEl: string
    sclk: string
    scaleFactor: string
    xyz: string
    subframeRect: string
    dimension: string
  }
  sol: number
  attitude: string
  image_files: {
    medium: string
    small: string
    full_res: string
    large: string
  }
  imageid: string
  camera: {
    filter_name: string
    camera_vector: string
    camera_model_component_list: string
    camera_position: string
    instrument: string
    camera_model_type: string
  }
  caption: string
  sample_type: string
  date_taken_mars: string
  credit: string
  date_taken_utc: string
  json_link: string
  link: string
  drive: string
  title: string
  site: number
  date_received: string
}

export default class NasaRssApiService {
  private readonly baseUrl =
    'https://mars.nasa.gov/rss/api/?feed=raw_images&category=mars2020,ingenuity&feedtype=json&ver=1.2&num=100&page={page}&&order=sol+desc&&&'

  /**
   * Maps camera instrument names from RSS feed to camera codes in database
   */
  private mapInstrumentToCameraCode(instrument: string, roverId: number): string {
    // Normalize instrument name
    const normalized = instrument.toUpperCase().trim()

    // Perseverance (rover_id 1) camera mappings
    if (roverId === 1) {
      const mappings: Record<string, string> = {
        NAVCAM_LEFT: 'NAVCAM_LEFT',
        NAVCAM_RIGHT: 'NAVCAM_RIGHT',
        MCZ_LEFT: 'MCZ_LEFT',
        MCZ_RIGHT: 'MCZ_RIGHT',
        FRONT_HAZCAM_LEFT_A: 'FRONT_HAZCAM_LEFT_A',
        FRONT_HAZCAM_RIGHT_A: 'FRONT_HAZCAM_RIGHT_A',
        REAR_HAZCAM_LEFT: 'REAR_HAZCAM_LEFT',
        REAR_HAZCAM_RIGHT: 'REAR_HAZCAM_RIGHT',
        SHERLOC_WATSON: 'SHERLOC_WATSON',
        SHERLOC_ACI: 'SHERLOC_ACI',
        PIXL_MCC: 'PIXL_MCC',
        SUPERCAM_RMI: 'SUPERCAM_RMI',
        SKYCAM: 'SKYCAM',
        EDL_RUCAM: 'EDL_RUCAM',
        EDL_RDCAM: 'EDL_RDCAM',
        EDL_DDCAM: 'EDL_DDCAM',
        EDL_PUCAM1: 'EDL_PUCAM1',
        EDL_PUCAM2: 'EDL_PUCAM2',
        LCAM: 'LCAM',
      }

      return mappings[normalized] || normalized
    }

    // Curiosity (rover_id 2) camera mappings
    if (roverId === 2) {
      const mappings: Record<string, string> = {
        MASTCAM: 'MAST',
        MAHLI: 'MAHLI',
        MARDI: 'MARDI',
        CHEMCAM: 'CHEMCAM',
        NAVCAM: 'NAVCAM',
        FHAZ: 'FHAZ',
        RHAZ: 'RHAZ',
      }

      return mappings[normalized] || normalized
    }

    // Opportunity (rover_id 3) camera mappings
    if (roverId === 3) {
      const mappings: Record<string, string> = {
        PANCAM: 'PANCAM',
        NAVCAM: 'NAVCAM',
        FHAZ: 'FHAZ',
        RHAZ: 'RHAZ',
        MINITES: 'MINITES',
        ENTRY: 'ENTRY',
      }

      return mappings[normalized] || normalized
    }

    return normalized
  }

  /**
   * Maps mission name from RSS feed to rover ID
   */
  private async mapMissionToRoverId(mission: string): Promise<number | null> {
    const normalized = mission.toLowerCase().trim()

    // Map mission names to rover names
    const missionToRover: Record<string, string> = {
      'mars2020': 'Perseverance',
      'perseverance': 'Perseverance',
      'msl': 'Curiosity',
      'curiosity': 'Curiosity',
      'mer-a': 'Spirit',
      'spirit': 'Spirit',
      'mer-b': 'Opportunity',
      'opportunity': 'Opportunity',
      'ingenuity': 'Perseverance', // Ingenuity is part of Perseverance mission
    }

    const roverName = missionToRover[normalized]
    if (!roverName) {
      logger.warn(`Unknown mission name: ${mission}`)
      return null
    }

    const rover = await Rover.query().where('name', roverName).first()
    if (!rover) {
      logger.warn(`Rover not found in database: ${roverName}`)
      return null
    }

    return rover.id
  }

  /**
   * Fetches a single page from the RSS feed
   */
  private async fetchPage(page: number): Promise<NasaRssFeedResponse | null> {
    try {
      const url = this.baseUrl.replace('{page}', String(page))
      logger.info(`Fetching RSS feed page ${page}: ${url}`)

      const response = await fetch(url)
      if (!response.ok) {
        logger.warn(`RSS API returned ${response.status} for page ${page}`)
        return null
      }

      const data = (await response.json()) as NasaRssFeedResponse
      return data
    } catch (error) {
      logger.error(`Failed to fetch RSS feed page ${page}:`, error)
      return null
    }
  }

  /**
   * Extracts and stores all images from the RSS feed
   */
  async extractAndStoreAllImages(): Promise<{ inserted: number; skipped: number; errors: number }> {
    let inserted = 0
    let skipped = 0
    let errors = 0
    let currentPage = 1
    let totalPages = 1

    logger.info('Starting RSS feed extraction...')

    // Fetch first page to get total pages
    const firstPage = await this.fetchPage(1)
    if (!firstPage || !firstPage.images || firstPage.images.length === 0) {
      logger.warn('No images found in RSS feed')
      return { inserted: 0, skipped: 0, errors: 0 }
    }

    totalPages = Math.ceil(firstPage.total_results / firstPage.per_page)
    logger.info(`Total pages to fetch: ${totalPages} (${firstPage.total_results} total images)`)

    // Process first page
    const firstPageResult = await this.processImages(firstPage.images, firstPage.mission)
    inserted += firstPageResult.inserted
    skipped += firstPageResult.skipped
    errors += firstPageResult.errors

    // Process remaining pages
    for (currentPage = 2; currentPage <= totalPages; currentPage++) {
      const pageData = await this.fetchPage(currentPage)
      if (!pageData || !pageData.images || pageData.images.length === 0) {
        logger.warn(`No images found on page ${currentPage}`)
        continue
      }

      const pageResult = await this.processImages(pageData.images, pageData.mission)
      inserted += pageResult.inserted
      skipped += pageResult.skipped
      errors += pageResult.errors

      logger.info(
        `Page ${currentPage}/${totalPages} processed: ${pageResult.inserted} inserted, ${pageResult.skipped} skipped, ${pageResult.errors} errors`
      )

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    logger.info(
      `RSS feed extraction completed: ${inserted} inserted, ${skipped} skipped, ${errors} errors`
    )
    return { inserted, skipped, errors }
  }

  /**
   * Processes a batch of images and stores them in the database
   */
  private async processImages(
    images: NasaRssFeedResponseImage[],
    mission: string
  ): Promise<{ inserted: number; skipped: number; errors: number }> {
    let inserted = 0
    let skipped = 0
    let errors = 0

    // Handle comma-separated missions (e.g., "mars2020,ingenuity")
    const missions = mission.split(',').map((m) => m.trim())

    for (const image of images) {
      // Declare variables outside try block for error logging
      let roverId: number | null = null
      let cameraId: number | null = null
      let camera: { id: number; code: string; full_name: string } | null = null

      try {
        // Try to find rover ID for each mission until we find a matching camera

        for (const singleMission of missions) {
          const candidateRoverId = await this.mapMissionToRoverId(singleMission)
          if (!candidateRoverId) continue

          // Map camera instrument to camera code
          const cameraCode = this.mapInstrumentToCameraCode(
            image.camera.instrument,
            candidateRoverId
          )

          // Query camera and get its ID directly from database
          // Note: Camera model declares 'code' as primary key, but database has 'id' as primary key
          const db = await import('@adonisjs/lucid/services/db')
          const cameraRecord = await db.default
            .from('cameras')
            .where('code', cameraCode)
            .where('rover_id', candidateRoverId)
            .select('id', 'code', 'full_name')
            .first()

          if (cameraRecord && cameraRecord.id) {
            roverId = candidateRoverId
            cameraId = cameraRecord.id
            camera = {
              id: cameraRecord.id,
              code: cameraRecord.code,
              full_name: cameraRecord.full_name,
            }
            break
          }
        }

        if (!camera || !roverId || !cameraId) {
          logger.warn(
            `Camera not found for image ${image.imageid}: instrument="${image.camera.instrument}", missions="${missions.join(', ')}"`
          )
          errors++
          continue
        }

        // Validate required fields before creating
        const imgSrc = image.image_files?.full_res || image.image_files?.large
        const thumbnailUrl = image.image_files?.small || image.image_files?.medium

        if (!imgSrc) {
          logger.warn(
            `Missing image source for image ${image.imageid}: image_files=${JSON.stringify(image.image_files)}`
          )
          errors++
          continue
        }

        if (!thumbnailUrl) {
          logger.warn(
            `Missing thumbnail URL for image ${image.imageid}: image_files=${JSON.stringify(image.image_files)}`
          )
          errors++
          continue
        }

        // Check if image already exists
        const existing = await RoverImage.query().where('img_src', imgSrc).first()

        if (existing) {
          skipped++
          continue
        }

        // Create rover image record
        await RoverImage.create({
          sol: image.sol,
          camera_id: cameraId,
          img_src: imgSrc,
          thumbnail_url: thumbnailUrl,
          rover_id: roverId,
          title: image.title || `Sol ${image.sol} - ${camera.full_name}`,
          caption: image.caption || '',
          credits: image.credit || 'NASA/JPL-Caltech',
        })

        inserted++
      } catch (error) {
        logger.error(
          `Error processing image ${image.imageid}: ${error instanceof Error ? error.message : String(error)}`
        )
        logger.error(`Image data:`, {
          imageid: image.imageid,
          sol: image.sol,
          instrument: image.camera?.instrument,
          roverId: roverId || null,
          cameraId: cameraId || null,
          imgSrc: image.image_files?.full_res || image.image_files?.large || 'MISSING',
          thumbnailUrl: image.image_files?.small || image.image_files?.medium || 'MISSING',
          title: image.title || 'MISSING',
          imageFiles: image.image_files,
        })
        if (error instanceof Error && error.stack) {
          logger.error(`Stack trace:`, error.stack)
        }
        errors++
      }
    }

    return { inserted, skipped, errors }
  }

  /**
   * Legacy method - kept for backwards compatibility
   */
  async getRssFeed() {
    return this.fetchPage(1)
  }
}
