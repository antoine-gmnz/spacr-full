import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'optimized_rover_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Compact storage - MD5 hash instead of full URL (32 chars vs 200+ chars)
      table.string('img_hash', 32).unique().notNullable().index()
      
      // Sol and rover info
      table.integer('sol').notNullable().index()
      table.integer('rover_id').unsigned().notNullable()
      
      // Camera code instead of full name (10 chars vs 50+ chars)
      table.string('camera_code', 10).notNullable()
      
      // Compressed metadata as JSON for rarely used fields
      table.json('metadata').nullable() // title, credits, etc.
      
      // Timestamps
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
      
      // Foreign keys
      table.foreign('rover_id').references('id').inTable('rovers').onDelete('CASCADE')
      table.foreign('camera_code').references('code').inTable('cameras')
      
      // Indexes for performance
      table.index(['rover_id', 'sol'])
      table.index(['camera_code', 'sol'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}