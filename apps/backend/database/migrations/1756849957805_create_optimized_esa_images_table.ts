import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'optimized_esa_images'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('release_date').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('release_date')
    })
  }
}