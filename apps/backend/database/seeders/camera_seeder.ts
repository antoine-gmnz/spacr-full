import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Camera from '#models/camera'

export default class extends BaseSeeder {
  async run() {
    console.log('Seeding cameras table...')
    
    await Camera.seedCommonCameras()
    
    const cameraCount = await Camera.query().count('* as total')
    console.log(`✓ Cameras seeded successfully. Total cameras: ${cameraCount[0].$extras.total}`)
  }
}