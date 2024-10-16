import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class Access extends BaseModel {
  static table = 'access'
  
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare route: string

  @column()
  declare createdBy: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare updatedBy: string | null

  @hasOne(() => User)
  declare user: HasOne<typeof User>
}