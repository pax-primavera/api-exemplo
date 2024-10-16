import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected schemaName = 'public'
  protected tableName = 'access'

  async up() {
    this.schema.withSchema(this.schemaName).createTable(this.tableName, (table) => {
      table.increments('id').primary().notNullable()
      table.integer('user_id').notNullable().unsigned().references('id').inTable('user').onDelete('NO ACTION')
      table.string('route', 100).notNullable().comment('Nome da rota de acesso. Consultar as mesmas na documentação.')
      table.timestamp('created_at').notNullable()
      table.string('created_by', 255).notNullable()
      table.timestamp('updated_at').nullable()
      table.string('updated_by', 255).nullable()

      // Definição de restrição unique para duas ou mais colunas.
      table.unique(['user_id', 'route'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}