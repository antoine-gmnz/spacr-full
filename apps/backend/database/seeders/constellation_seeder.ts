import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Constellation from '#models/constellation'

export default class extends BaseSeeder {
  async run() {
    await Constellation.seedCommonConstellations()
  }
}