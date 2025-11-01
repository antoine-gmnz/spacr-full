import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SpaceTelescope from '#models/space-telescope'

export default class extends BaseSeeder {
  async run() {
    const spaceTelescopes = [
      {
        name: 'JWST',
        fullName: 'James Webb Space Telescope',
        code: 'JWST',
        description:
          'The James Webb Space Telescope is the largest, most powerful space telescope ever built. It launched in December 2021.',
      },
      {
        name: 'HUBBLE',
        fullName: 'Hubble Space Telescope',
        code: 'HUBBLE',
        description:
          'The Hubble Space Telescope is a space telescope that was launched into low Earth orbit in 1990 and remains in operation.',
      },
    ]

    for (const telescope of spaceTelescopes) {
      await SpaceTelescope.updateOrCreate({ code: telescope.code }, telescope)
    }
  }
}
