import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('free_text')
      table.string('string_test')
      table.date('date_test')
      table.double('number_test')
      table.datetime('datetime_test')
      table.boolean('boolean_test').defaultTo(false)
      table.json('image_test')
      table.json('file_test')
      table.string('file_url')

      // specific to postgresql
      table.specificType('string_array_test', 'text[]').defaultTo('{}')

      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
