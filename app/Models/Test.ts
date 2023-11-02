import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { adomin } from 'App/Adomin/adominConfigurator'
import { scaffold } from 'App/Scaffolder/scaffolder'
import { DateTime } from 'luxon'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column(
    adomin({
      type: 'enum',
      label: 'Test de string',
      options: [
        { label: 'Salut', value: 'hello' },
        { label: 'Au revoir', value: 'bye' },
      ],
      subType: 'string',
    })
  )
  public stringTest: string

  @column.date(adomin({ type: 'date', defaultValue: { mode: 'now', plusDays: 2 } }))
  public dateTest: DateTime

  @column(
    adomin({
      type: 'enum',
      subType: 'number',
      options: [
        { label: 'Premier', value: 1 },
        { label: 'Deuxieme', value: 2 },
      ],
    })
  )
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
