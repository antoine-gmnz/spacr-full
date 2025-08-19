import vine from "@vinejs/vine";

export const paginateValidator = vine.compile(vine.object({
    page: vine.number(),
    limit: vine.number().positive(),
}))

export const getESAImagesValidator = vine.compile(vine.object({
    page: vine.number(),
    limit: vine.number().positive(),
}))

export const getRoverImagesValidator = vine.compile(vine.object({
    page: vine.number(),
    limit: vine.number().positive(),
    rover: vine.string(),
    camera: vine.string(),
    beginSol: vine.number(),
    endSol: vine.number(),
}))
