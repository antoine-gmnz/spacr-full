import vine from '@vinejs/vine'

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string(),
    password: vine
      .string()
      .minLength(12)
      .confirmed({ confirmationField: 'passwordConfirmation' }),
  })
)
