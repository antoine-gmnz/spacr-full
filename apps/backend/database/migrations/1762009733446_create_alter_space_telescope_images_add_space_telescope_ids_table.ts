import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'space_telescope_images'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add space_telescope_id column
      table.integer('space_telescope_id').unsigned().notNullable().after('type')
      table
        .foreign('space_telescope_id')
        .references('id')
        .inTable('space_telescopes')
        .onDelete('CASCADE')

      // Note: We'll keep the type column for now to allow migration, but it can be removed later
      // once all data is migrated to use space_telescope_id
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['space_telescope_id'])
      table.dropColumn('space_telescope_id')
    })
  }
}
