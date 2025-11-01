import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'constellations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('code').notNullable()
      table.string('full_name').notNullable()
      table.string('description').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
