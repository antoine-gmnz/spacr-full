import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_locations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('name', 60).notNullable()
      table.decimal('lat', 9, 6).notNullable()
      table.decimal('lng', 9, 6).notNullable()
      table.boolean('is_primary').notNullable().defaultTo(false)

      table.timestamp('created_at').defaultTo(this.db.rawQuery('CURRENT_TIMESTAMP').knexQuery)
      table.timestamp('updated_at').defaultTo(this.db.rawQuery('CURRENT_TIMESTAMP').knexQuery)

      table.index(['user_id'])
    })

    // Enforce single primary location per user at the DB level
    this.schema.raw(
      `CREATE UNIQUE INDEX user_locations_one_primary ON user_locations(user_id) WHERE is_primary = true`
    )
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}