import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { adomin } from 'App/Adomin/adominConfigurator'
import { scaffold } from 'App/Scaffolder/scaffolder'
import { DateTime } from 'luxon'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column(adomin('string'))
  public name: string

  @column.date(adomin('date'))
  public date: DateTime

  @column.dateTime(scaffold('date'))
  public datetime: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
