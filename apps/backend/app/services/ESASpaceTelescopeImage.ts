import ESASpaceTelescopeImage from "../models/ESASpaceTelescopeImage.js";

export default class ESASpaceTelescopeImageService {
    public async getImages(limit: number, page: number) {
        return await ESASpaceTelescopeImage.query().orderBy('id', 'desc').paginate(page, limit)
    }

    public async getImage(id: number) {
        return await ESASpaceTelescopeImage.find(id)
    }

    public async createImage(image: ESASpaceTelescopeImage) {
        return await ESASpaceTelescopeImage.create(image)
    }
}