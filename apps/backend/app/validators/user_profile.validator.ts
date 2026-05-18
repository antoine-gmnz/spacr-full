import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    displayName: vine.string().minLength(3).maxLength(60),
  })
)
