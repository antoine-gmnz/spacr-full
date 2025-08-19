import RoverImage from "#models/rover_image";

export default class RoverImageService {
    public async getImages(page: number, limit: number) {
        return await RoverImage.query().orderBy('id', 'desc').paginate(page, limit)
    }

    public async searchImages(rover: string, camera: string, beginSol: number, endSol: number, page: number, limit: number) {
        return await RoverImage.query().where('rover', rover).where('camera', camera).whereBetween('sol', [beginSol, endSol]).paginate(page, limit)
    }

    public async createImage(image: RoverImage) {
        return await RoverImage.create(image)
    }
}