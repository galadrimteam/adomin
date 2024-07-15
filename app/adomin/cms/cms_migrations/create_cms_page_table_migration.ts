import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cms_pages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('url').notNullable()
      table.string('title').notNullable()
      table.string('internal_label').notNullable()
      table.jsonb('config').notNullable()
      table.integer('views').notNullable().defaultTo(0)
      table.boolean('is_published').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
