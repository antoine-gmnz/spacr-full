import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'deep_space_objects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('physical_characteristics')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('physical_characteristics')
    })
  }
}