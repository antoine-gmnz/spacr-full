import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Camera from './camera.js'

export default class Rover extends BaseModel {
  static table = 'rovers'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare landing_date: Date

  @column()
  declare launch_date: Date

  @column()
  declare status: string

  @column()
  declare max_sol: number

  @column()
  declare max_date: Date

  @hasMany(() => Camera, {
    foreignKey: 'rover_id',
  })
  declare cameras: HasMany<typeof Camera>
}
