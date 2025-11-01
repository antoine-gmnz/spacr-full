import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Camera from '#models/camera'

export default class extends BaseSeeder {
  async run() {
    console.log('Seeding cameras table...')

    await Camera.create({
      code: 'EDL_RUCAM',
      full_name: 'Rover Up-Look Camera',
      rover_id: 1,
    })
    await Camera.create({
      code: 'EDL_RDCAM',
      full_name: 'Rover Down-Look Camera',
      rover_id: 1,
    })
    await Camera.create({
      code: 'EDL_DDCAM',
      full_name: 'Descent Stage Down-Look Camera',
      rover_id: 1,
    })
    await Camera.create({
      code: 'EDL_PUCAM1',
      full_name: 'Parachute Up-Look Camera A',
      rover_id: 1,
    })
    await Camera.create({
      code: 'EDL_PUCAM2',
      full_name: 'Parachute Up-Look Camera B',
      rover_id: 1,
    })
    await Camera.create({
      code: 'NAVCAM_LEFT',
      full_name: 'Navigation Camera - Left',
      rover_id: 1,
    })
    await Camera.create({
      code: 'NAVCAM_RIGHT',
      full_name: 'Navigation Camera - Right',
      rover_id: 1,
    })
    await Camera.create({
      code: 'MCZ_RIGHT',
      full_name: 'Mast Camera Zoom - Right',
      rover_id: 1,
    })
    await Camera.create({
      code: 'MCZ_LEFT',
      full_name: 'Mast Camera Zoom - Left',
      rover_id: 1,
    })
    await Camera.create({
      code: 'FRONT_HAZCAM_LEFT_A',
      full_name: 'Front Hazard Avoidance Camera - Left',
      rover_id: 1,
    })
    await Camera.create({
      code: 'FRONT_HAZCAM_RIGHT_A',
      full_name: 'Front Hazard Avoidance Camera - Right',
      rover_id: 1,
    })
    await Camera.create({
      code: 'REAR_HAZCAM_LEFT',
      full_name: 'Rear Hazard Avoidance Camera - Left',
      rover_id: 1,
    })
    await Camera.create({
      code: 'REAR_HAZCAM_RIGHT',
      full_name: 'Rear Hazard Avoidance Camera - Right',
      rover_id: 1,
    })
    await Camera.create({ code: 'SKYCAM', full_name: 'MEDA Skycam', rover_id: 1 })
    await Camera.firstOrCreate(
      { code: 'SHERLOC_WATSON', rover_id: 1 },
      {
        code: 'SHERLOC_WATSON',
        full_name: 'SHERLOC WATSON Camera',
        rover_id: 1,
      }
    )
    await Camera.firstOrCreate(
      { code: 'SHERLOC_ACI', rover_id: 1 },
      {
        code: 'SHERLOC_ACI',
        full_name: 'SHERLOC ACI (Autofocus and Context Imager)',
        rover_id: 1,
      }
    )
    await Camera.firstOrCreate(
      { code: 'PIXL_MCC', rover_id: 1 },
      {
        code: 'PIXL_MCC',
        full_name: 'PIXL Micro Context Camera',
        rover_id: 1,
      }
    )
    await Camera.create({
      code: 'SUPERCAM_RMI',
      full_name: 'SuperCam Remote Micro Imager',
      rover_id: 1,
    })
    await Camera.create({
      code: 'LCAM',
      full_name: 'Lander Vision System Camera',
      rover_id: 1,
    })

    await Camera.create({
      code: 'FHAZ',
      full_name: 'Front Hazard Avoidance Camera',
      rover_id: 3,
    })
    await Camera.create({
      code: 'RHAZ',
      full_name: 'Read Hazard Avoidance Camera',
      rover_id: 3,
    })
    await Camera.create({ code: 'NAVCAM', full_name: 'Navigation Camera', rover_id: 3 })
    await Camera.create({ code: 'PANCAM', full_name: 'Panoramic Camera', rover_id: 3 })
    await Camera.create({
      code: 'MINITES',
      full_name: 'Miniature Thermal Emission Spectrometer (Mini-TES)',
      rover_id: 3,
    })
    await Camera.create({
      code: 'ENTRY',
      full_name: 'Entry, Descent, and Landing Camera',
      rover_id: 3,
    })

    await Camera.create({
      code: 'FHAZ',
      full_name: 'Front Hazard Avoidance Camera',
      rover_id: 2,
    })
    await Camera.create({
      code: 'RHAZ',
      full_name: 'Read Hazard Avoidance Camera',
      rover_id: 2,
    })
    await Camera.create({ code: 'MAST', full_name: 'Mast Camera', rover_id: 2 })
    await Camera.create({
      code: 'CHEMCAM',
      full_name: 'Chemistry and Camera Complex',
      rover_id: 2,
    })
    await Camera.create({ code: 'MAHLI', full_name: 'Mars Hand Lens Imager', rover_id: 2 })
    await Camera.create({ code: 'MARDI', full_name: 'Mars Descent Imager', rover_id: 2 })
    await Camera.create({ code: 'NAVCAM', full_name: 'Navigation Camera', rover_id: 2 })

    const cameraCount = await Camera.query().count('* as total')
    console.log(`✓ Cameras seeded successfully. Total cameras: ${cameraCount[0].$extras.total}`)
  }
}
