import { withAuthFinder } from '@adonisjs/auth'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { compose } from '@adonisjs/core/helpers'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, computed, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Idea from './idea.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare rights: number

  @column()
  declare settings: { color: string; isBeautiful: boolean; age?: number } | null

  @hasMany(() => Idea)
  declare ideas: HasMany<typeof Idea>

  @hasOne(() => Idea)
  declare idea: HasOne<typeof Idea> | null

  @manyToMany(() => User, {
    pivotTable: 'user_friends',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'friend_id',
  })
  declare friends: ManyToMany<typeof User>

  @computed()
  get isBeautiful() {
    return this.settings?.isBeautiful ?? false
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
