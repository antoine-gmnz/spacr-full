import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cameras'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('code').notNullable()
      table.string('full_name').notNullable()
      table.integer('rover_id').notNullable()
      table.foreign('rover_id').references('id').inTable('rovers')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
