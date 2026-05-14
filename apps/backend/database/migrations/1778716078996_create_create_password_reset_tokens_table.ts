import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'password_reset_tokens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('token_hash', 64).notNullable()
      table.timestamp('expires_at').notNullable()
      table.timestamp('used_at').nullable()

      table.timestamp('created_at').defaultTo(this.db.rawQuery('CURRENT_TIMESTAMP').knexQuery)

      table.index(['token_hash'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}