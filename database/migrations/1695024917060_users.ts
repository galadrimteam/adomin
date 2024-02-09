import Env from '@ioc:Adonis/Core/Env'
import Hash from '@ioc:Adonis/Core/Hash'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('email', 255).notNullable().unique()
      table.string('password', 180).notNullable()
      table.string('remember_me_token').nullable()

      table.integer('rights').unsigned().notNullable().defaultTo(0)

      table.integer('profile_id').unsigned().references('profiles.id').onDelete('SET NULL')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      const now = Env.get('DB_CONNECTION') === 'sqlite' ? DateTime.now() : new Date()

      this.defer(async (db) => {
        await db.table(this.tableName).insert({
          email: 'test@test.fr',
          password: await Hash.make('test'),
          created_at: now,
          updated_at: now,
        })
      })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
