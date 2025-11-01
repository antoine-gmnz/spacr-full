import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'space_telescope_images'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('esa_id').notNullable().unique()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('esa_id')
    })
  }
}
