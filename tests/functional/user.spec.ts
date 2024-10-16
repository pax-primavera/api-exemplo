import { UserFactory } from '#database/factories/user_factory'
import env from '#start/env'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

test.group('Testes Funcionais - Usuários', (group) => {
    group.each.setup(async () => {
      await db.beginGlobalTransaction()
      return () => db.rollbackGlobalTransaction()
    })
  
    test('Cadastro', async ({ client }) => {
      const login = await UserFactory.with('access', 1).make()
      const password = login.password
      await login.save()

      const responseLogin = await client.post('api/v1/login').headers({'X-Credentials': env.get('APP_KEY')}).json({email: login.email, password: password})
      const userFake = await UserFactory.with('access', 1).make()
      const body = {
        fullname: userFake.fullname,
        email: userFake.email,
        password: userFake.password,
        access: [ 'teste' ]
      }
      const response = await client.post('api/v1/user').headers({'X-Credentials': env.get('APP_KEY')}).bearerToken(responseLogin.body().data.token).json(body)
      response.assertStatus(201)
    })
  
})