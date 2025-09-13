import { HttpContext } from "@adonisjs/core/http";
import { inject } from "@adonisjs/core";
import ESASpaceTelescopeImageService from "#services/ESASpaceTelescopeImage";
import { paginateValidator, searchESAImagesValidator } from "#validators/get_validators";
import OptimizedEsaImage from "#models/optimized_esa_image";

export default class ESASpaceTelescopeImageController {
    @inject()
    public async getImages(ctx: HttpContext, esaSpaceTelescopeImageService: ESASpaceTelescopeImageService) {
        const data = ctx.request.all()
        const { page, limit } = await paginateValidator.validate(data)

        const images = await esaSpaceTelescopeImageService.getImages(page, limit)

        return ctx.response.json(images)
    }

    @inject()
    public async searchImages(ctx: HttpContext, esaSpaceTelescopeImageService: ESASpaceTelescopeImageService) {
        const data = ctx.request.all()
        const { page, limit, search } = await searchESAImagesValidator.validate(data)

        const images = (await esaSpaceTelescopeImageService.searchImages(search, page, limit)).serialize()
        console.log(images)
        images.data = images.data.map((image: any) => {
            const imgSrc = OptimizedEsaImage.reconstructImageUrl(image.esaId, image.type, false)
            const imgFullSize = OptimizedEsaImage.reconstructImageUrl(image.esaId, image.type, true)

            const metadata = {
                imgSrc,
                imgFullSize
            }

            return {
                ...image,
                metadata
            }
        })

        return ctx.response.json(images)
    }
}