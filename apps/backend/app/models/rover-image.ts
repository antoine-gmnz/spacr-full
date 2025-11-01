import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Rover from './rover.js'
import Camera from './camera.js'

export default class RoverImage extends BaseModel {
  static table = 'rover_images'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare sol: number

  @column({ columnName: 'camera_id' })
  declare camera_id: number

  @belongsTo(() => Camera, {
    foreignKey: 'camera_id',
    localKey: 'id',
  })
  declare camera: BelongsTo<typeof Camera>

  @column()
  declare img_src: string

  @column()
  declare thumbnail_url: string

  @column({ columnName: 'rover_id' })
  declare rover_id: number

  @belongsTo(() => Rover, {
    foreignKey: 'rover_id',
  })
  declare rover: BelongsTo<typeof Rover>

  @column()
  declare title: string

  @column()
  declare caption: string

  @column()
  declare credits: string
}
