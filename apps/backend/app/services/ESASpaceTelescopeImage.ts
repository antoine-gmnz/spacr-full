import ESASpaceTelescopeImage from "../models/optimized_esa_image.js";

export default class ESASpaceTelescopeImageService {
    public async getImages(page: number, limit: number) {
        return await ESASpaceTelescopeImage.query().orderBy('id', 'desc').paginate(page, limit)
    }

    public async getImage(id: number) {
        return await ESASpaceTelescopeImage.find(id)
    }

    public async createImage(image: ESASpaceTelescopeImage) {
        return await ESASpaceTelescopeImage.create(image)
    }

    public async searchImages(search: string, page: number, limit: number) {
        return (await ESASpaceTelescopeImage.query().where('title', 'ILIKE', `%${search}%`).paginate(page, limit))
    }
}