import vine from '@vinejs/vine'

export const createLocationValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(60),
    lat: vine.number().range([-90, 90]),
    lng: vine.number().range([-180, 180]),
  })
)

export const updateLocationValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(60).optional(),
    lat: vine.number().range([-90, 90]).optional(),
    lng: vine.number().range([-180, 180]).optional(),
    isPrimary: vine.boolean().optional(),
  })
)
