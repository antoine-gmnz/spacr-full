import { BaseSeeder } from '@adonisjs/lucid/seeders'
import CelestialBody from '#models/celestial_body'
import Star from '#models/star'
import Satellite from '#models/satellite'
import DeepSpaceObject from '#models/deep_space_object'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    console.log('🌌 Seeding 3D Space Explorer database...')

    // Seed planets and dwarf planets
    console.log('🪐 Seeding planets...')
    await CelestialBody.seedPlanets()
    await CelestialBody.seedDwarfPlanets()
    console.log('🪐 Planets and dwarf planets seeded successfully!')

    // Seed bright stars
    console.log('⭐ Seeding bright stars...')
    await Star.seedBrightStars()
    console.log('⭐ Bright stars seeded successfully!')

    // Seed satellites
    console.log('🛰️ Seeding satellites...')
    await Satellite.seedISS()
    await Satellite.seedStarlinkSatellites()
    console.log('🛰️ Satellites seeded successfully!')

    // Seed deep space objects
    console.log('🌠 Seeding deep space objects...')
    await DeepSpaceObject.seedMessierObjects()
    console.log('🌠 Deep space objects seeded successfully!')

    // Seed additional celestial bodies (moons, asteroids)
    console.log('🌙 Seeding moons and asteroids...')
    await this.seedMoons()
    await this.seedAsteroids()
    console.log('🌙 Moons and asteroids seeded successfully!')

    // Seed additional stars
    console.log('✨ Seeding additional stars...')
    await this.seedAdditionalStars()
    console.log('✨ Additional stars seeded successfully!')

    // Seed additional satellites
    console.log('📡 Seeding additional satellites...')
    await this.seedAdditionalSatellites()
    console.log('📡 Additional satellites seeded successfully!')

    console.log('✅ 3D Space Explorer database seeded successfully!')
  }

  private async seedMoons() {
    const moons = [
      {
        name: 'Luna',
        type: 'moon' as const,
        massLog: 22.866, // log10(7.342e22)
        radius: 1737.4,
        orbitalPeriod: 27.32,
        rotationPeriod: 27.32,
        inclination: 5.145,
        eccentricity: 0.0549,
        semiMajorAxis: 0.00257, // in AU
        description: 'Earth\'s only natural satellite, the Moon.',
        parentBodyId: 3 // Earth
      },
      {
        name: 'Phobos',
        type: 'moon' as const,
        massLog: 16.028, // log10(1.0659e16)
        radius: 11.2667,
        orbitalPeriod: 0.3189,
        rotationPeriod: 0.3189,
        inclination: 1.093,
        eccentricity: 0.0151,
        semiMajorAxis: 0.00015, // in AU
        description: 'The larger and innermost of Mars\' two moons.',
        parentBodyId: 4 // Mars
      },
      {
        name: 'Deimos',
        type: 'moon' as const,
        massLog: 15.169, // log10(1.4762e15)
        radius: 6.2,
        orbitalPeriod: 1.2624,
        rotationPeriod: 1.2624,
        inclination: 1.788,
        eccentricity: 0.0002,
        semiMajorAxis: 0.00023, // in AU
        description: 'The smaller and outermost of Mars\' two moons.',
        parentBodyId: 4 // Mars
      },
      {
        name: 'Io',
        type: 'moon' as const,
        massLog: 22.951, // log10(8.932e22)
        radius: 1821.6,
        orbitalPeriod: 1.769,
        rotationPeriod: 1.769,
        inclination: 0.036,
        eccentricity: 0.0041,
        semiMajorAxis: 0.00282, // in AU
        description: 'The innermost of Jupiter\'s four Galilean moons.',
        parentBodyId: 5 // Jupiter
      },
      {
        name: 'Europa',
        type: 'moon' as const,
        massLog: 22.681, // log10(4.8e22)
        radius: 1560.8,
        orbitalPeriod: 3.551,
        rotationPeriod: 3.551,
        inclination: 0.466,
        eccentricity: 0.0094,
        semiMajorAxis: 0.00448, // in AU
        description: 'The smallest of Jupiter\'s four Galilean moons.',
        parentBodyId: 5 // Jupiter
      }
    ]

    for (const moon of moons) {
      await CelestialBody.updateOrCreate(
        { name: moon.name },
        moon
      )
    }
  }

  private async seedAsteroids() {
    const asteroids = [
      {
        name: 'Ceres',
        type: 'asteroid' as const,
        massLog: 20.972, // log10(9.3835e20)
        radius: 473,
        orbitalPeriod: 1681.63,
        rotationPeriod: 0.378,
        inclination: 10.6,
        eccentricity: 0.0758,
        semiMajorAxis: 2.766,
        description: 'The largest object in the asteroid belt between Mars and Jupiter.',
        isActive: true
      },
      {
        name: 'Vesta',
        type: 'asteroid' as const,
        massLog: 20.413, // log10(2.5908e20)
        radius: 262.7,
        orbitalPeriod: 1325.85,
        rotationPeriod: 0.2226,
        inclination: 7.14,
        eccentricity: 0.0886,
        semiMajorAxis: 2.362,
        description: 'The second-largest asteroid in the asteroid belt.',
        isActive: true
      },
      {
        name: 'Pallas',
        type: 'asteroid' as const,
        massLog: 20.324, // log10(2.11e20)
        radius: 256,
        orbitalPeriod: 1686.04,
        rotationPeriod: 0.3256,
        inclination: 34.84,
        eccentricity: 0.2313,
        semiMajorAxis: 2.773,
        description: 'The third-largest asteroid in the asteroid belt.',
        isActive: true
      }
    ]

    for (const asteroid of asteroids) {
      await CelestialBody.updateOrCreate(
        { name: asteroid.name },
        asteroid
      )
    }
  }

  private async seedAdditionalStars() {
    const additionalStars = [
      {
        name: 'Polaris',
        bayerDesignation: 'α UMi',
        ra: 37.9529,
        dec: 89.2642,
        magnitude: 1.97,
        spectralType: 'F7Ib',
        distanceLog: 2.636, // log10(433)
        parallax: 0.007,
        properMotionRa: 0.198,
        properMotionDec: -0.015,
        luminosityLog: 3.100, // log10(1260)
        temperatureLog: 3.779, // log10(6015)
        colorIndex: '0.636',
        isVariable: false,
        description: 'The North Star, located very close to the north celestial pole.'
      },
      {
        name: 'Betelgeuse',
        bayerDesignation: 'α Ori',
        ra: 88.7929,
        dec: 7.4071,
        magnitude: 0.42,
        spectralType: 'M1-2Ia-ab',
        distanceLog: 2.808, // log10(642.5)
        parallax: 0.005,
        properMotionRa: 0.027,
        properMotionDec: 0.011,
        luminosityLog: 5.100, // log10(126000)
        temperatureLog: 3.556, // log10(3600)
        colorIndex: '1.85',
        isVariable: true,
        description: 'A red supergiant star in the constellation Orion.'
      },
      {
        name: 'Rigel',
        bayerDesignation: 'β Ori',
        ra: 78.6345,
        dec: -8.2016,
        magnitude: 0.13,
        spectralType: 'B8Ia',
        distanceLog: 2.934, // log10(860)
        parallax: 0.004,
        properMotionRa: 0.002,
        properMotionDec: 0.001,
        luminosityLog: 5.079, // log10(120000)
        temperatureLog: 4.083, // log10(12100)
        colorIndex: '-0.03',
        isVariable: false,
        description: 'A blue supergiant star in the constellation Orion.'
      },
      {
        name: 'Proxima Centauri',
        bayerDesignation: 'α Cen C',
        ra: 217.4290,
        dec: -62.6795,
        magnitude: 11.13,
        spectralType: 'M5.5Ve',
        distanceLog: 0.628, // log10(4.2465)
        parallax: 0.768,
        properMotionRa: -3.772,
        properMotionDec: 0.769,
        luminosityLog: -2.770, // log10(0.0017)
        temperatureLog: 3.483, // log10(3042)
        colorIndex: '1.82',
        isVariable: true,
        description: 'The closest known star to the Sun, a red dwarf.'
      }
    ]

    for (const star of additionalStars) {
      await Star.updateOrCreate(
        { name: star.name },
        star
      )
    }
  }

  private async seedAdditionalSatellites() {
    const additionalSatellites = [
      {
        name: 'Hubble Space Telescope',
        noradId: 20580,
        type: 'spacecraft' as const,
        launchDate: DateTime.fromISO('1990-04-24'),
        missionType: 'Space Telescope',
        status: 'active' as const,
        country: 'USA',
        operator: 'NASA/ESA',
        description: 'The Hubble Space Telescope is a space telescope that was launched into low Earth orbit in 1990.',
        inclination: 28.47,
        eccentricity: 0.000283,
        semiMajorAxis: 6917.0,
        period: 96.0,
        lastUpdated: DateTime.now()
      },
      {
        name: 'James Webb Space Telescope',
        noradId: 50463,
        type: 'spacecraft' as const,
        launchDate: DateTime.fromISO('2021-12-25'),
        missionType: 'Space Telescope',
        status: 'active' as const,
        country: 'USA',
        operator: 'NASA/ESA/CSA',
        description: 'The James Webb Space Telescope is the largest optical telescope in space.',
        inclination: 0.0,
        eccentricity: 0.0,
        // TODO: Fix this in db, it's not correct
        semiMajorAxis: 1500000.0, // At L2 point
        period: 182.625 * 24 * 60, // 1 year in minutes
        lastUpdated: DateTime.now()
      },
      {
        name: 'GPS IIR-1',
        noradId: 24876,
        type: 'satellite' as const,
        launchDate: DateTime.fromISO('1997-07-23'),
        missionType: 'Navigation',
        status: 'active' as const,
        country: 'USA',
        operator: 'US Air Force',
        description: 'GPS navigation satellite.',
        inclination: 55.0,
        eccentricity: 0.0,
        semiMajorAxis: 26560.0,
        period: 1436.0, // 24 hours in minutes
        lastUpdated: DateTime.now()
      }
    ]

    for (const satellite of additionalSatellites) {
      await Satellite.updateOrCreate(
        { noradId: satellite.noradId },
        satellite
      )
    }
  }
}