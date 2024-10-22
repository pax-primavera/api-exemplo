import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Access from './access.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { formatJSON } from '../utils/format.js'

// Configuração do AuthFinder para autenticação baseada em email e senha.
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],                  // Identificadores únicos (UIDs) para autenticação.
  passwordColumnName: 'password',  // Nome da coluna de senha no banco de dados.
})

/**
 * Modelo de Usuário.
 *
 * Este modelo representa os usuários da aplicação, incluindo suas propriedades
 * e relacionamentos com outros modelos, como o modelo de Acessos.
 */
export default class User extends compose(BaseModel, AuthFinder) {
  // Nome da tabela no banco de dados.
  static table = 'user'

  // ID do usuário (chave primária).
  @column({ isPrimary: true })
  declare id: number

  // Nome completo do usuário.
  @column()
  declare fullname: string

  // Email do usuário (deve ser único).
  @column()
  declare email: string

  // Senha do usuário (não deve ser serializada).
  @column({ serializeAs: null })
  declare password: string

  // Status ativo do usuário.
  @column()
  declare active: boolean

  // Identificação de quem criou o usuário.
  @column()
  declare createdBy: string

  // Data de criação do usuário.
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Data da última atualização do usuário.
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Identificação de quem atualizou o usuário.
  @column()
  declare updatedBy: string | null

  // Método para geração de token de autenticação para o usuário.
  static accessTokens = DbAccessTokensProvider.forModel(User)

  // Relacionamento: um usuário pode ter muitos acessos.
  @hasMany(() => Access)
  declare access: HasMany<typeof Access>

  /**
   * Formatação do usuário antes de salvar no banco de dados.
   *
   * Este método é chamado antes de salvar o modelo no banco de dados,
   * permitindo a formatação dos dados do usuário conforme necessário.
   * Aqui, usamos a função `formatJSON` para formatar o objeto do usuário.
   *
   * @param user - O objeto de usuário que está sendo salvo.
   */
  @beforeSave()
  public static async format(user: User) {
    user = formatJSON(user)  // Aplica a formatação ao objeto do usuário.
  }
}
