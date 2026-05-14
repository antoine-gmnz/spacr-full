import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS pgcrypto')

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('display_name', 60).nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()

      table.timestamp('created_at').defaultTo(this.db.rawQuery('CURRENT_TIMESTAMP').knexQuery)
      table.timestamp('updated_at').defaultTo(this.db.rawQuery('CURRENT_TIMESTAMP').knexQuery)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}