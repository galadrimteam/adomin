import { AttachmentContract, attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { adomin } from 'App/Adomin/adominConfigurator'
import { scaffold } from 'App/Scaffolder/scaffolder'
import { DateTime } from 'luxon'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column(adomin({ type: 'string', label: 'Texte libre' }))
  public freeText: string

  @column(
    adomin({
      type: 'enum',
      label: 'Test select',
      options: [
        { label: 'Salut', value: 'hello' },
        { label: 'Au revoir', value: 'bye' },
      ],
    })
  )
  public stringTest: string

  @column.date(
    adomin({ type: 'date', subType: 'date', defaultValue: { mode: 'now', plusDays: 2 } })
  )
  public dateTest: DateTime

  @column(adomin({ type: 'number' }))
  public numberTest: number

  @column.dateTime(scaffold('date'))
  public datetimeTest: DateTime

  @column({
    prepare: (value) => (value ? 1 : 0),
    consume: (value) => Boolean(value),
    ...adomin({ type: 'boolean', variant: 'switch' }),
  })
  public booleanTest: boolean

  @attachment(
    adomin({
      type: 'file',
      label: 'Avatar',
      isImage: true,
      quality: 1,
      maxWidth: 100,
      maxHeight: 100,
    })
  )
  public imageTest: AttachmentContract

  @attachment(adomin({ type: 'file', label: 'Contrat' }))
  public fileTest: AttachmentContract

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
