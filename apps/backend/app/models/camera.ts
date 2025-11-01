import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Rover from './rover.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Camera extends BaseModel {
  static table = 'cameras'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare full_name: string

  @column()
  declare rover_id: number

  @belongsTo(() => Rover, {
    foreignKey: 'rover_id',
  })
  declare rover: BelongsTo<typeof Rover>
}
