import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import UserLocationsService from '#services/user_locations.service'
import UserLocation from '#models/user_location'
import { createLocationValidator, updateLocationValidator } from '#validators/user_location.validator'
import type { UserLocationDto } from '@spacr/shared-types'

function toDto(loc: UserLocation): UserLocationDto {
  return {
    id: loc.id,
    userId: loc.userId,
    name: loc.name,
    lat: Number(loc.lat),
    lng: Number(loc.lng),
    isPrimary: loc.isPrimary,
    createdAt: loc.createdAt.toISO()!,
  }
}

export default class UserLocationsController {
  @inject()
  async list({ auth, response }: HttpContext, service: UserLocationsService) {
    const locations = await service.list(auth.user!.id)
    return response.ok({ locations: locations.map(toDto) })
  }

  @inject()
  async create({ request, auth, response }: HttpContext, service: UserLocationsService) {
    const data = await request.validateUsing(createLocationValidator)

    try {
      const location = await service.create(auth.user!.id, data)
      return response.created(toDto(location))
    } catch (err: any) {
      if (err.code === 'E_LOCATION_LIMIT') {
        return response.unprocessableEntity({ error: err.message })
      }
      throw err
    }
  }

  @inject()
  async update({ request, params, auth, response }: HttpContext, service: UserLocationsService) {
    const data = await request.validateUsing(updateLocationValidator)

    if (data.isPrimary === true) {
      const location = await service.setPrimary(auth.user!.id, params.id)
      return response.ok(toDto(location))
    }

    const location = await UserLocation.query()
      .where('id', params.id)
      .where('user_id', auth.user!.id)
      .firstOrFail()

    location.merge({ name: data.name, lat: data.lat, lng: data.lng })
    await location.save()

    return response.ok(toDto(location))
  }

  @inject()
  async destroy({ params, auth, response }: HttpContext, service: UserLocationsService) {
    await service.delete(auth.user!.id, params.id)
    return response.noContent()
  }
}
