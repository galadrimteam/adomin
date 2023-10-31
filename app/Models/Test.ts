import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { adomin } from 'App/Adomin/adominConfigurator'
import { scaffold } from 'App/Scaffolder/scaffolder'
import { DateTime } from 'luxon'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column(adomin('string'))
  public stringTest: string

  @column.date(adomin('date'))
  public dateTest: DateTime

  @column(adomin('number'))
  public numberTest: number

  @column.dateTime(scaffold('date'))
  public datetimeTest: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
