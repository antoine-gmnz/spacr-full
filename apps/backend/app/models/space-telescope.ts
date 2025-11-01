import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ESASpaceTelescopeImage from './space-telescope-image.js'

export default class SpaceTelescope extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare fullName: string

  @column()
  declare description: string | null

  @column()
  declare code: string

  @hasMany(() => ESASpaceTelescopeImage)
  declare images: HasMany<typeof ESASpaceTelescopeImage>
}
