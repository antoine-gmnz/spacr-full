import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rover_images'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Change string columns to text to support longer URLs and captions
      table.text('img_src').alter()
      table.text('thumbnail_url').alter()
      table.text('caption').alter()
      table.text('title').alter()
      // Credits is less likely to exceed 255, but let's make it text too for consistency
      table.text('credits').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revert back to string (VARCHAR(255))
      table.string('img_src').alter()
      table.string('thumbnail_url').alter()
      table.string('caption').alter()
      table.string('title').alter()
      table.string('credits').alter()
    })
  }
}