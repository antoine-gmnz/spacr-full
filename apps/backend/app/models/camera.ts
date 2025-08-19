import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import OptimizedRoverImage from '#models/optimized_rover_image'
import { DateTime } from 'luxon'

export default class Camera extends BaseModel {
  @column({ isPrimary: true })
  declare code: string

  @column()
  declare fullName: string

  @column()
  declare description: string | null

  @column()
  declare roverType: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => OptimizedRoverImage, {
    foreignKey: 'cameraCode'
  })
  declare roverImages: HasMany<typeof OptimizedRoverImage>

  // Helper method to seed common cameras
  static async seedCommonCameras() {
    const cameras = [
      // Legacy cameras (Curiosity, Opportunity, etc.)
      { code: 'FHAZ', fullName: 'Front Hazard Avoidance Camera', roverType: 'CURIOSITY' },
      { code: 'RHAZ', fullName: 'Rear Hazard Avoidance Camera', roverType: 'CURIOSITY' },
      { code: 'MAST', fullName: 'Mast Camera', roverType: 'CURIOSITY' },
      { code: 'CHEMCAM', fullName: 'Chemistry and Camera Complex', roverType: 'CURIOSITY' },
      { code: 'MAHLI', fullName: 'Mars Hand Lens Imager', roverType: 'CURIOSITY' },
      { code: 'MARDI', fullName: 'Mars Descent Imager', roverType: 'CURIOSITY' },
      { code: 'NAVCAM', fullName: 'Navigation Camera', roverType: 'CURIOSITY' },
      { code: 'PANCAM', fullName: 'Panoramic Camera', roverType: 'OPPORTUNITY' },
      { code: 'MINITES', fullName: 'Miniature Thermal Emission Spectrometer', roverType: 'OPPORTUNITY' },
      
      // Perseverance Entry, Descent, and Landing (EDL) cameras
      { code: 'EDL_RUCAM', fullName: 'Rover Up-Look Camera', roverType: 'PERSEVERANCE' },
      { code: 'EDL_RDCAM', fullName: 'Rover Down-Look Camera', roverType: 'PERSEVERANCE' },
      { code: 'EDL_DDCAM', fullName: 'Descent Stage Down-Look Camera', roverType: 'PERSEVERANCE' },
      { code: 'EDL_PUCAM1', fullName: 'Parachute Up-Look Camera A', roverType: 'PERSEVERANCE' },
      { code: 'EDL_PUCAM2', fullName: 'Parachute Up-Look Camera B', roverType: 'PERSEVERANCE' },
      
      // Perseverance Navigation cameras
      { code: 'NAVCAM_L', fullName: 'Navigation Camera - Left', roverType: 'PERSEVERANCE' },
      { code: 'NAVCAM_R', fullName: 'Navigation Camera - Right', roverType: 'PERSEVERANCE' },
      
      // Perseverance Mast cameras
      { code: 'MCZ_RIGHT', fullName: 'Mast Camera Zoom - Right', roverType: 'PERSEVERANCE' },
      { code: 'MCZ_LEFT', fullName: 'Mast Camera Zoom - Left', roverType: 'PERSEVERANCE' },
      
      // Perseverance Hazard Avoidance cameras
      { code: 'FHAZ_LEFT', fullName: 'Front Hazard Avoidance Camera - Left', roverType: 'PERSEVERANCE' },
      { code: 'FHAZ_RIGHT', fullName: 'Front Hazard Avoidance Camera - Right', roverType: 'PERSEVERANCE' },
      { code: 'RHAZ_LEFT', fullName: 'Rear Hazard Avoidance Camera - Left', roverType: 'PERSEVERANCE' },
      { code: 'RHAZ_RIGHT', fullName: 'Rear Hazard Avoidance Camera - Right', roverType: 'PERSEVERANCE' },
      
      // Perseverance Science cameras
      { code: 'SKYCAM', fullName: 'MEDA Skycam', roverType: 'PERSEVERANCE' },
      { code: 'WATSON', fullName: 'SHERLOC WATSON Camera', roverType: 'PERSEVERANCE' },
    ]

    for (const camera of cameras) {
      await Camera.updateOrCreate(
        { code: camera.code },
        camera
      )
    }
  }
}
