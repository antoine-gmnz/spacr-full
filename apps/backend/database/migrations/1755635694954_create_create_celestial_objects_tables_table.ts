import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'create_celestial_objects_tables'

  async up() {
    // Create celestial_bodies table (if not exists)
    if (!(await this.schema.hasTable('celestial_bodies'))) {
      this.schema.createTable('celestial_bodies', (table) => {
        table.increments('id')
        table.string('name', 100).notNullable()
        table.string('type', 50).notNullable() // 'planet', 'dwarf_planet', 'asteroid', 'comet', 'moon'
        
        // Logarithmic mass storage (log10 of mass in kg)
        table.decimal('mass_log', 6, 3) // log10(mass in kg) - efficient for all scales
        
        table.decimal('radius', 10, 3) // in km
        table.decimal('orbital_period', 10, 3) // in Earth days
        table.decimal('rotation_period', 10, 3) // in Earth days
        table.decimal('inclination', 8, 4) // orbital inclination in degrees
        table.decimal('eccentricity', 8, 6) // orbital eccentricity
        table.decimal('semi_major_axis', 12, 6) // in AU
        table.string('texture_url', 255) // 3D texture file
        table.string('model_url', 255) // 3D model file
        table.integer('parent_body_id').unsigned().references('id').inTable('celestial_bodies') // for moons
        table.json('orbital_elements') // Additional orbital parameters
        table.text('description')
        table.boolean('is_active').defaultTo(true)

        table.timestamp('created_at')
        table.timestamp('updated_at')

        // Indexes for performance
        table.index(['type'])
        table.index(['name'])
        table.index(['parent_body_id'])
        table.index(['mass_log'])
      })
    }

    // Create stars table (if not exists)
    if (!(await this.schema.hasTable('stars'))) {
      this.schema.createTable('stars', (table) => {
        table.increments('id')
        table.string('name', 100)
        table.string('bayer_designation', 20)
        table.decimal('ra', 10, 6) // Right Ascension in degrees
        table.decimal('dec', 10, 6) // Declination in degrees
        table.decimal('magnitude', 5, 2) // Apparent magnitude
        table.string('spectral_type', 10)
        table.decimal('distance_log', 5, 2) // log10(distance in light years) - astronomical precision
        table.decimal('parallax', 8, 4) // in arcseconds
        table.decimal('proper_motion_ra', 8, 4) // in arcseconds/year
        table.decimal('proper_motion_dec', 8, 4) // in arcseconds/year
        table.decimal('luminosity_log', 4, 2) // log10(solar luminosities) - astronomical precision
        table.decimal('temperature_log', 3, 2) // log10(temperature in K) - astronomical precision
        table.string('color_index', 10) // B-V color index
        table.boolean('is_variable').defaultTo(false)
        table.text('description')

        table.timestamp('created_at')
        table.timestamp('updated_at')

        // Indexes for performance
        table.index(['ra', 'dec'])
        table.index(['magnitude'])
        table.index(['spectral_type'])
        table.index(['distance_log'])
      })
    }

    // Create satellites table (if not exists)
    if (!(await this.schema.hasTable('satellites'))) {
      this.schema.createTable('satellites', (table) => {
        table.increments('id')
        table.string('name', 100).notNullable()
        table.integer('norad_id').unique() // NORAD catalog ID
        table.string('type', 50) // 'satellite', 'spacecraft', 'debris', 'space_station'
        table.date('launch_date')
        table.string('mission_type', 100)
        table.string('status', 50) // 'active', 'inactive', 'debris', 'decayed'
        table.string('tle_line1', 100) // Two-Line Element set
        table.string('tle_line2', 100)
        table.decimal('inclination', 8, 4) // orbital inclination
        table.decimal('eccentricity', 8, 6) // orbital eccentricity
        table.decimal('semi_major_axis', 12, 6) // in km
        table.decimal('period', 8, 4) // orbital period in minutes
        table.string('country', 50) // launching country
        table.string('operator', 100) // satellite operator
        table.text('description')
        table.timestamp('last_updated')

        table.timestamp('created_at')
        table.timestamp('updated_at')

        // Indexes for performance
        table.index(['norad_id'])
        table.index(['type'])
        table.index(['status'])
        table.index(['country'])
      })
    }

    // Create celestial_positions table for real-time positions (if not exists)
    if (!(await this.schema.hasTable('celestial_positions'))) {
      this.schema.createTable('celestial_positions', (table) => {
        table.increments('id')
        table.integer('object_id').notNullable()
        table.string('object_type', 50).notNullable() // 'planet', 'star', 'satellite', 'asteroid'
        table.timestamp('timestamp').notNullable()
        table.decimal('ra', 10, 6) // Right Ascension
        table.decimal('dec', 10, 6) // Declination
        table.decimal('distance', 15, 6) // Distance from Earth
        table.decimal('magnitude', 5, 2) // Apparent magnitude
        table.decimal('phase', 5, 4) // Illumination phase (0-1)
        table.decimal('angular_size', 8, 4) // Apparent size in arcseconds
        table.decimal('x_coord', 15, 6) // 3D Cartesian coordinates
        table.decimal('y_coord', 15, 6)
        table.decimal('z_coord', 15, 6)
        table.decimal('elongation', 8, 4) // Angular distance from Sun
        table.decimal('altitude', 8, 4) // Altitude above horizon (if applicable)
        table.decimal('azimuth', 8, 4) // Azimuth angle (if applicable)

        table.timestamp('created_at')
        table.timestamp('updated_at')

        // Indexes for performance
        table.index(['object_id', 'object_type'])
        table.index(['timestamp'])
        table.index(['ra', 'dec'])
        table.index(['object_type', 'timestamp'])
      })
    }

    // Create satellite_passes table (if not exists)
    if (!(await this.schema.hasTable('satellite_passes'))) {
      this.schema.createTable('satellite_passes', (table) => {
        table.increments('id')
        table.integer('satellite_id').notNullable().unsigned().references('id').inTable('satellites')
        table.decimal('location_lat', 8, 6)
        table.decimal('location_lon', 9, 6)
        table.timestamp('rise_time')
        table.timestamp('set_time')
        table.decimal('max_elevation', 5, 2) // in degrees
        table.integer('duration_minutes')
        table.decimal('rise_azimuth', 8, 4) // rise azimuth angle
        table.decimal('set_azimuth', 8, 4) // set azimuth angle
        table.string('pass_type', 20) // 'visible', 'daylight', 'twilight'

        table.timestamp('created_at')
        table.timestamp('updated_at')

        // Indexes for performance
        table.index(['satellite_id'])
        table.index(['location_lat', 'location_lon'])
        table.index(['rise_time'])
        table.index(['pass_type'])
      })
    }

    // Create deep_space_objects table (if not exists)
    if (!(await this.schema.hasTable('deep_space_objects'))) {
      this.schema.createTable('deep_space_objects', (table) => {
        table.increments('id')
        table.string('name', 100).notNullable()
        table.string('catalog_name', 100) // NGC, Messier, etc.
        table.string('type', 50) // 'galaxy', 'nebula', 'cluster', 'quasar'
        table.decimal('ra', 10, 6) // Right Ascension
        table.decimal('dec', 10, 6) // Declination
        table.decimal('magnitude', 5, 2) // Apparent magnitude
        table.decimal('distance_log', 5, 2) // log10(distance in light years) - astronomical precision
        table.decimal('angular_size', 8, 4) // in arcminutes
        table.string('constellation', 50)
        table.text('description')
        table.json('physical_characteristics') // Size, mass, etc.
        table.string('discoverer', 100)
        table.integer('discovery_year')
        table.boolean('is_visible_naked_eye').defaultTo(false)

        table.timestamp('created_at')
        table.timestamp('updated_at')

        // Indexes for performance
        table.index(['type'])
        table.index(['catalog_name'])
        table.index(['constellation'])
        table.index(['ra', 'dec'])
        table.index(['magnitude'])
      })
    }
  }

  async down() {
    // Drop tables in reverse order to handle foreign key constraints
    this.schema.dropTableIfExists('satellite_passes')
    this.schema.dropTableIfExists('celestial_positions')
    this.schema.dropTableIfExists('deep_space_objects')
    this.schema.dropTableIfExists('satellites')
    this.schema.dropTableIfExists('stars')
    this.schema.dropTableIfExists('celestial_bodies')
  }
}