import { UserFactory } from '#database/factories/user_factory'
import env from '#start/env'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

/** 
 * Grupo de Testes Funcionais para Usuários
 * 
 * Este grupo de testes é responsável por validar as funcionalidades relacionadas 
 * ao cadastro de usuários na API. Ele inclui o teste de criação de usuários 
 * e sua verificação de autenticação.
 */
test.group('Testes Funcionais - Usuários', (group) => {
  
  // Configura o contexto para cada teste, garantindo que as transações 
  // sejam iniciadas e revertidas adequadamente.
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  /** 
   * Teste para o Cadastro de Usuário
   * 
   * Este teste verifica se o cadastro de um novo usuário funciona corretamente. 
   * Ele realiza o seguinte fluxo:
   * 1. Cria um usuário fake e salva no banco de dados.
   * 2. Realiza o login do usuário para obter um token de autenticação.
   * 3. Tenta cadastrar um novo usuário utilizando o token de autenticação.
   * 4. Verifica se a resposta do servidor indica que o usuário foi criado com sucesso.
   */
  test('Cadastro', async ({ client }) => {
    // Cria um usuário fake com acessos e salva no banco de dados
    const login = await UserFactory.with('access', 1).make()
    const password = login.password
    await login.save()

    // Realiza o login para obter um token de autenticação
    const responseLogin = await client.post('api/v1/login')
      .headers({'X-Credentials': env.get('APP_KEY')})
      .json({ email: login.email, password: password })

    // Cria outro usuário fake para o cadastro
    const userFake = await UserFactory.with('access', 1).make()
    const body = {
      fullname: userFake.fullname,
      email: userFake.email,
      password: userFake.password,
      access: ['teste']
    }

    // Tenta cadastrar o novo usuário utilizando o token de autenticação
    const response = await client.post('api/v1/user')
      .headers({'X-Credentials': env.get('APP_KEY')})
      .bearerToken(responseLogin.body().data.token)
      .json(body)

    // Verifica se a resposta indica que o usuário foi criado com sucesso
    response.assertStatus(201)
  })
})
