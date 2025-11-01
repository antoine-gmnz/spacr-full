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
    begin_sol: vine.number(),
    end_sol: vine.number(),
}))

export const searchESAImagesValidator = vine.compile(vine.object({
    search: vine.string(),
    page: vine.number(),
    limit: vine.number().positive(),
}))