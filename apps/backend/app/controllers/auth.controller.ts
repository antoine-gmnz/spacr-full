import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth.validator'
import type { UserDto } from '@spacr/shared-types'

function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISO()!,
  }
}

export default class AuthController {
  async register({ request, auth, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const user = await User.create({
      email: data.email,
      password: data.password,
      displayName: data.displayName ?? null,
    })

    await auth.use('web').login(user)

    return response.created({ user: toUserDto(user) })
  }

  async login({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)

    return response.ok({ user: toUserDto(user) })
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.noContent()
  }

  async me({ auth, response }: HttpContext) {
    return response.ok({ user: toUserDto(auth.user!) })
  }
}
