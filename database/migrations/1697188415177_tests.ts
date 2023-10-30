import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'tests'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.date('date')
      table.datetime('datetime')

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
