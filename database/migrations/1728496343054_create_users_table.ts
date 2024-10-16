import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  // Importante definir o schema quando utilizar mais de um no contexto do sistema.  
  protected schemaName = 'public'
  protected tableName = 'user' // Nomenclatura padrão das tabelas sempre no singular

  async up() {
    this.schema.withSchema(this.schemaName).createTable(this.tableName, (table) => {
      table.increments('id').primary().notNullable()
      table.string('fullname', 255).nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.boolean('active').notNullable().defaultTo(true).comment('Indica se o registro está ativo')
      table.timestamp('created_at').notNullable()
      table.string('created_by', 255).notNullable()
      table.timestamp('updated_at').nullable()
      table.string('updated_by', 255).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}