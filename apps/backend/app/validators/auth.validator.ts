import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine
      .string()
      .minLength(12)
      .confirmed({ confirmationField: 'passwordConfirmation' }),
    displayName: vine.string().minLength(3).maxLength(60).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
  })
)
