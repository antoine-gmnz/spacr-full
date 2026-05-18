import db from '@adonisjs/lucid/services/db'
import UserLocation from '#models/user_location'

const LOCATION_LIMIT = 5

export default class UserLocationsService {
  async list(userId: string): Promise<UserLocation[]> {
    return UserLocation.query()
      .where('user_id', userId)
      .orderByRaw('is_primary DESC, created_at ASC')
  }

  async create(
    userId: string,
    payload: { name: string; lat: number; lng: number }
  ): Promise<UserLocation> {
    const count = await UserLocation.query().where('user_id', userId).count('* as total')
    const total = Number(count[0].$extras.total)

    if (total >= LOCATION_LIMIT) {
      const error = new Error(`Maximum of ${LOCATION_LIMIT} locations allowed`)
      ;(error as any).code = 'E_LOCATION_LIMIT'
      throw error
    }

    return UserLocation.create({ userId, ...payload })
  }

  async setPrimary(userId: string, id: string): Promise<UserLocation> {
    const location = await UserLocation.query()
      .where('id', id)
      .where('user_id', userId)
      .firstOrFail()

    await db.transaction(async (trx) => {
      await UserLocation.query({ client: trx })
        .where('user_id', userId)
        .where('is_primary', true)
        .update({ is_primary: false })

      await location.useTransaction(trx).merge({ isPrimary: true }).save()
    })

    await location.refresh()
    return location
  }

  async delete(userId: string, id: string): Promise<void> {
    const location = await UserLocation.query()
      .where('id', id)
      .where('user_id', userId)
      .firstOrFail()

    const wasPrimary = location.isPrimary
    await location.delete()

    if (wasPrimary) {
      const oldest = await UserLocation.query()
        .where('user_id', userId)
        .orderBy('created_at', 'asc')
        .first()

      if (oldest) {
        oldest.isPrimary = true
        await oldest.save()
      }
    }
  }
}
