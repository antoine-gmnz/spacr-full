import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'esa_space_telescope_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.string('img_src')
      table.string('esa_id')
      table.string('img_full_size')
      table.string('title')
      table.string('credits')
      table.string('constellation')
      table.string('fov')
      table.string('release_date')
      table.string('type')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}