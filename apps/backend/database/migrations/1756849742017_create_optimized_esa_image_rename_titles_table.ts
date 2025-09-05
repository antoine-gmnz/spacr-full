import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'optimized_esa_images'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('title_short', 'title')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('title', 'title_short')
    })
  }
}