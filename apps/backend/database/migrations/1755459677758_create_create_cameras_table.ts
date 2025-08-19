import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cameras'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('code', 10).primary() // e.g., 'FHAZ', 'RHAZ', 'MAST'
      table.string('full_name', 100).notNullable() // e.g., 'Front Hazard Avoidance Camera'
      table.string('description', 255).nullable()
      table.string('rover_type', 20).nullable() // 'PERSEVERANCE', 'CURIOSITY', etc.
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}