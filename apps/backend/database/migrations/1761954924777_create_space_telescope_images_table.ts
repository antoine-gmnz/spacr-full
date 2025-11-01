import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'space_telescope_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.string('img_src').notNullable()
      table.string('img_full_size').notNullable()

      table.string('title').notNullable()
      table.string('credits').notNullable()

      table.string('fov').notNullable()
      table.string('release_date').notNullable()
      table.string('type').notNullable()

      table.integer('constellation_id').notNullable()
      table.foreign('constellation_id').references('id').inTable('constellations')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
