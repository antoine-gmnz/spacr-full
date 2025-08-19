import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'constellations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('code', 20).primary() // e.g., 'ORI', 'CAS', 'UMA'
      table.string('full_name', 100).notNullable() // e.g., 'Orion', 'Cassiopeia'
      table.string('description', 255).nullable()
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}