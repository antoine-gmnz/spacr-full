import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rovers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at').defaultTo(this.db.rawQuery('CURRENT_TIMESTAMP').knexQuery)
      table.timestamp('updated_at').defaultTo(this.db.rawQuery('CURRENT_TIMESTAMP').knexQuery)

      table.date('landing_date').notNullable()
      table.date('launch_date').notNullable()
      table.date('max_date').notNullable()

      table.string('status').notNullable()
      table.string('name').notNullable()

      table.integer('max_sol').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
