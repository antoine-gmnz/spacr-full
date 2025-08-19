import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'optimized_esa_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Compact identifiers
      table.string('esa_id', 50).unique().notNullable().index()
      table.string('img_hash', 32).unique().notNullable().index()
      
      // Shortened title (100 chars vs unlimited)
      table.string('title_short', 100).notNullable()
      
      // Constellation code instead of full name
      table.string('constellation_code', 20).nullable()
      
      // Standardized FOV (20 chars vs unlimited)
      table.string('fov', 20).nullable()
      
      // Year instead of full date (4 bytes vs 8+ bytes)
      table.integer('release_year').nullable().index()
      
      // Type enum (10 chars vs unlimited)
      table.enum('type', ['JWST', 'HUBBLE', 'OTHER']).notNullable().index()
      
      // Compressed metadata for less frequently accessed fields
      table.json('metadata').nullable() // full title, credits, release_date, etc.
      
      // Timestamps
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      
      // Foreign keys
      table.foreign('constellation_code').references('code').inTable('constellations')
      
      // Indexes for performance
      table.index(['type', 'release_year'])
      table.index(['constellation_code', 'type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}