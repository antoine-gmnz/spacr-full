import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import OptimizedEsaImage from './optimized_esa_image.js'
import { DateTime } from 'luxon'

export default class Constellation extends BaseModel {
  @column({ isPrimary: true })
  declare code: string

  @column()
  declare fullName: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => OptimizedEsaImage, {
    foreignKey: 'constellationCode'
  })
  declare esaImages: HasMany<typeof OptimizedEsaImage>

  // Helper method to seed common constellations
  static async seedCommonConstellations() {
    const constellations = [
      { code: 'ORI', fullName: 'Orion', description: 'The Hunter constellation' },
      { code: 'CAS', fullName: 'Cassiopeia', description: 'The Queen constellation' },
      { code: 'UMA', fullName: 'Ursa Major', description: 'The Great Bear constellation' },
      { code: 'UMI', fullName: 'Ursa Minor', description: 'The Little Bear constellation' },
      { code: 'DRA', fullName: 'Draco', description: 'The Dragon constellation' },
      { code: 'CYG', fullName: 'Cygnus', description: 'The Swan constellation' },
      { code: 'AQL', fullName: 'Aquila', description: 'The Eagle constellation' },
      { code: 'LYR', fullName: 'Lyra', description: 'The Lyre constellation' },
      { code: 'VUL', fullName: 'Vulpecula', description: 'The Fox constellation' },
      { code: 'SGR', fullName: 'Sagittarius', description: 'The Archer constellation' },
      { code: 'SCO', fullName: 'Scorpius', description: 'The Scorpion constellation' },
      { code: 'CEN', fullName: 'Centaurus', description: 'The Centaur constellation' },
      { code: 'CAR', fullName: 'Carina', description: 'The Keel constellation' },
      { code: 'VEL', fullName: 'Vela', description: 'The Sails constellation' },
      { code: 'PUP', fullName: 'Puppis', description: 'The Stern constellation' },
    ]

    for (const constellation of constellations) {
      await Constellation.updateOrCreate(
        { code: constellation.code },
        constellation
      )
    }
  }
}
