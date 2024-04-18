import hash from '@adonisjs/core/services/hash'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()

      table.integer('rights').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      this.defer(async (db) => {
        const now = new Date()

        await db.table(this.tableName).insert({
          email: 'test@test.fr',
          password: await hash.make('test'),
          created_at: now,
          updated_at: now,
        })
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
