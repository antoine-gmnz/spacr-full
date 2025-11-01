import RoverImage from '#models/rover-image'

export default class RoverImageService {
  public async getImages(page: number, limit: number) {
    return await RoverImage.query()
      .preload('rover')
      .preload('camera')
      .orderBy('id', 'desc')
      .paginate(page, limit)
  }

  public async searchImages(
    rover: string,
    camera: string,
    beginSol: number,
    endSol: number,
    page: number,
    limit: number
  ) {
    return await RoverImage.query()
      .preload('rover')
      .preload('camera')
      .where('rover_images.rover_id', rover)
      .where('rover_images.camera_id', camera)
      .whereBetween('sol', [beginSol, endSol])
      .paginate(page, limit)
  }

  public async createOrFindImage(image: Partial<RoverImage>) {
    const existing = await RoverImage.query().where('img_src', String(image.img_src)).first()
    if (existing) {
      return { record: existing, created: false }
    }
    const created = await RoverImage.create(image)
    return { record: created, created: true }
  }

  public async createImagesBatchOrFind(images: Partial<RoverImage>[]) {
    let inserted = 0
    let skipped = 0
    const records: RoverImage[] = []
    for (const img of images) {
      const { record, created } = await this.createOrFindImage(img)
      if (created) inserted++
      else skipped++
      records.push(record)
    }
    return { records, inserted, skipped }
  }
}
