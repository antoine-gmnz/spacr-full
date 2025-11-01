import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rover_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('sol').notNullable()

      table.integer('camera_id').notNullable()
      table.foreign('camera_id').references('id').inTable('cameras')

      table.string('img_src').notNullable()
      table.string('thumbnail_url').notNullable()

      table.integer('rover_id').notNullable()
      table.foreign('rover_id').references('id').inTable('rovers')

      table.string('title').notNullable()
      table.string('caption').notNullable()
      table.string('credits').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
