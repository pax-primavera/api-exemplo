import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, hasOne } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import { formatJSON } from '../utils/format.js'

/**
 * Modelo de Acesso.
 *
 * Este modelo representa os acessos dos usuários na aplicação, incluindo suas propriedades
 * e relacionamentos com outros modelos, como o modelo de Usuário.
 */
export default class Access extends BaseModel {
  // Nome da tabela no banco de dados.
  static table = 'access'

  // ID do acesso (chave primária).
  @column({ isPrimary: true })
  declare id: number

  // ID do usuário associado a este acesso.
  @column()
  declare userId: number

  // Rota associada ao acesso do usuário.
  @column()
  declare route: string

  // Identificação de quem criou o acesso.
  @column()
  declare createdBy: string

  // Data de criação do acesso.
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Data da última atualização do acesso.
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Identificação de quem atualizou o acesso.
  @column()
  declare updatedBy: string | null

  // Relacionamento: um acesso pertence a um usuário.
  @hasOne(() => User)
  declare user: HasOne<typeof User>

  /**
   * Formatação do acesso antes de salvar no banco de dados.
   *
   * Este método é chamado antes de salvar o modelo no banco de dados,
   * permitindo a formatação dos dados do acesso conforme necessário.
   * Aqui, usamos a função `formatJSON` para formatar o objeto do acesso.
   *
   * @param access - O objeto de acesso que está sendo salvo.
   */
  @beforeSave()
  public static async format(access: Access) {
    access = formatJSON(access)  // Aplica a formatação ao objeto do acesso.
  }
}
