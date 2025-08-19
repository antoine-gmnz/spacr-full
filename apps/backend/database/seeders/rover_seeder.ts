import Rover from '#models/rover'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await Rover.create({
      name: 'Perseverance',
      launch_date: new Date('2021-02-18 00:00:00'),
      landing_date: new Date('2020-07-30 00:00:00'),
      status: 'active',
      max_sol: -1,
      max_date: new Date('2025-05-26 00:00:00'),
    })

    await Rover.create({
      name: 'Curiosity',
      launch_date: new Date('2012-08-06 00:00:00'),
      landing_date: new Date('2011-11-26 00:00:00'),
      status: 'active',
      max_sol: -1,
      max_date: new Date('2025-05-26 00:00:00'),
    })

    await Rover.create({
      name: 'Opportunity',
      launch_date: new Date('2004-01-25 00:00:00'),
      landing_date: new Date('2003-07-07 00:00:00'),
      status: 'complete',
      max_sol: 5111,
      max_date: new Date('2018-06-11 00:00:00'),
    })
  }
}