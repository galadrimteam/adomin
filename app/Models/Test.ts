import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { adomin } from 'App/Adomin/adominConfigurator'
import { scaffold } from 'App/Scaffolder/scaffolder'
import { DateTime } from 'luxon'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column(adomin('string'))
  public stringTest: string

  @column.date(adomin({ type: 'date', defaultValue: { mode: 'now', plusDays: 2 } }))
  public dateTest: DateTime

  @column(adomin({ type: 'number', min: 10, max: 20, step: 0.1 }))
  public numberTest: number

  @column.dateTime(scaffold('date'))
  public datetimeTest: DateTime

  @column({
    prepare: (value) => (value ? 1 : 0),
    consume: (value) => Boolean(value),
    ...adomin({ type: 'boolean', variant: 'switch' }),
  })
  public booleanTest: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
