import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import PasswordResetService from '#services/password_reset.service'
import {
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/password_reset.validator'

export default class PasswordResetController {
  @inject()
  async forgotPassword(
    { request, response }: HttpContext,
    service: PasswordResetService
  ) {
    const { email } = await request.validateUsing(forgotPasswordValidator)
    await service.requestReset(email)
    return response.noContent()
  }

  @inject()
  async resetPassword(
    { request, response }: HttpContext,
    service: PasswordResetService
  ) {
    const { token, password } = await request.validateUsing(resetPasswordValidator)

    try {
      await service.resetPassword(token, password)
      return response.noContent()
    } catch (err: any) {
      if (err.code === 'E_INVALID_RESET_TOKEN') {
        return response.unprocessableEntity({ error: 'Invalid or expired reset token' })
      }
      throw err
    }
  }
}
