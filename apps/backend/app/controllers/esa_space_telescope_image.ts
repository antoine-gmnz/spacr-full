import { HttpContext } from "@adonisjs/core/http";
import { inject } from "@adonisjs/core";
import ESASpaceTelescopeImageService from "#services/ESASpaceTelescopeImage";
import { paginateValidator } from "#validators/get_validators";

export default class ESASpaceTelescopeImageController {
    @inject()
    public async getImages(ctx: HttpContext, esaSpaceTelescopeImageService: ESASpaceTelescopeImageService) {
        const data = ctx.request.all()
        const { page, limit } = await paginateValidator.validate(data)

        const images = await esaSpaceTelescopeImageService.getImages(page, limit)

        return ctx.response.json(images)
    }
}