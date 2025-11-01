import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'space_telescopes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').notNullable().unique() // e.g., 'JWST', 'HUBBLE'
      table.string('full_name').notNullable() // e.g., 'James Webb Space Telescope', 'Hubble Space Telescope'
      table.string('description').nullable()
      table.string('code').notNullable().unique() // e.g., 'JWST', 'HUBBLE'

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
