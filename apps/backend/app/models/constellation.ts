import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Constellation extends BaseModel {
  static table = 'constellations'

  @column({ isPrimary: true })
  declare code: string

  @column()
  declare fullName: string

  @column()
  declare description: string | null
}
