import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // @column()
  // declare stringArrayTest: string[]

  @column()
  declare freeText: string

  @column()
  declare stringTest: string

  @column.date()
  declare dateTest: DateTime

  @column()
  declare numberTest: number

  @column.dateTime()
  declare datetimeTest: DateTime | null

  @column({
    prepare: (value) => (value ? 1 : 0),
    consume: (value) => Boolean(value),
  })
  declare booleanTest: boolean

  @column()
  declare userId: number | null

  @column()
  declare fileUrl: string | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
