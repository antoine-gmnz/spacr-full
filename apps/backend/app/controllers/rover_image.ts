import { HttpContext } from "@adonisjs/core/http";
import { getRoverImagesValidator, paginateValidator } from "../validators/get_validators.js";
import RoverImageService from "#services/rover_images";
import { inject } from "@adonisjs/core";

export default class RoverImageController {

    @inject()
    public async searchImages(ctx: HttpContext, roverImageService: RoverImageService) {
        const data = ctx.request.all()
        const { page, limit, rover, camera, beginSol, endSol } = await getRoverImagesValidator.validate(data)

        const roverImages = await roverImageService.searchImages(rover, camera, beginSol, endSol, page, limit)

        return ctx.response.json(roverImages)
    }

    @inject()
    public async getImages(ctx: HttpContext, roverImageService: RoverImageService) {
        const data = ctx.request.all()
        console.log(data)
        const { page, limit } = await paginateValidator.validate(data)

        const roverImages = await roverImageService.getImages(page, limit)

        return ctx.response.json(roverImages)
    }
}