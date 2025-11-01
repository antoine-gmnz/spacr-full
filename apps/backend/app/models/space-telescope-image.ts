import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import type { DateTime } from 'luxon'
import Constellation from './constellation.js'
import SpaceTelescope from './space-telescope.js'

export default class SpaceTelescopeImage extends BaseModel {
  static table = 'space_telescope_images'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare img_src: string

  @column()
  declare esa_id: string

  @column()
  declare img_full_size: string

  @column()
  declare title: string

  @column()
  declare credits: string

  @column()
  declare constellation_id: number

  @belongsTo(() => Constellation)
  declare constellation: BelongsTo<typeof Constellation>

  @column()
  declare fov: string

  @column()
  declare release_date: string

  @column()
  declare type: string

  @column()
  declare space_telescope_id: number

  @belongsTo(() => SpaceTelescope)
  declare spaceTelescope: BelongsTo<typeof SpaceTelescope>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
