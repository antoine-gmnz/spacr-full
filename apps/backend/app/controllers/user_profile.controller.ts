import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/user_profile.validator'
import type { UserDto } from '@spacr/shared-types'
import type User from '#models/user'

function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt.toISO()!,
  }
}

export default class UserProfileController {
  @inject()
  async update({ request, auth, response }: HttpContext) {
    const { displayName } = await request.validateUsing(updateProfileValidator)
    const user = auth.user!
    user.displayName = displayName
    await user.save()
    return response.ok({ user: toUserDto(user) })
  }
}
