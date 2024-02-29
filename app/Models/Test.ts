import { AttachmentContract, attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'
import User from './User'

export default class Test extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  // @column()
  // public stringArrayTest: string[]

  @column()
  public freeText: string

  @column()
  public stringTest: string

  @column.date()
  public dateTest: DateTime

  @column()
  public numberTest: number

  @column.dateTime()
  public datetimeTest: DateTime | null

  @column({
    prepare: (value) => (value ? 1 : 0),
    consume: (value) => Boolean(value),
  })
  public booleanTest: boolean

  @attachment()
  public imageTest: AttachmentContract

  @attachment()
  public fileTest: AttachmentContract

  @column()
  public userId: number | null

  @column()
  public fileUrl: string | null

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
