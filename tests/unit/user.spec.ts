import UsersController from '#controllers/users_controller'
import { UserFactory } from '#database/factories/user_factory'
import UserService from '#services/user_service'
import { createUser } from '#validators/user'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import sinon from 'sinon'

/** Grupo de seleção dos testes unitários */
test.group('Testes Unitários - UsuarioService', (group) => {
  // Configuração para iniciar uma transação e executar o rollback a cada teste realizado.
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  test('index', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).create()
    const result = await new UserService().index({})

    assert.exists(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].id, user.id)
  })

  test('index - Busca vazia', async ({ assert }) => {
    const result = await new UserService().index({})

    assert.exists(result)
    assert.equal(result.length, 0)
  })

  test('index - Busca com parâmetros', async ({ assert }) => {
    const users = await UserFactory.with('access').createMany(3)
    const result = await new UserService().index({ fullname: users[0].fullname })

    assert.exists(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].id, users[0].id)
  })

  test('show', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).create()
    const result = await new UserService().show(user.id)

    assert.exists(result)
    assert.equal(result.id, user.id)
  })

  test('show - ID inválido', async ({ assert }) => {
    try {
      await new UserService().show(123)
      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
      assert.include(error.message, 'not found')
    }
  })

  test('create', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).make()
    const result = await new UserService().create(user, 'Teste')
    assert.exists(result)
    assert.equal(result, user.id)
  })

  test('create - Falha de validação', async ({ assert }) => {
    try {
      let user = {
        fullname: 'Teste'
      }
      await new UserService().create(user, 'teste')
      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
    }
  })

  test('update', async ({ assert }) => {
    try {
      const user = await UserFactory.with('access', 1).create()
      const updateUser = {
        fullname: 'Nome atualizado',
        access: [{
          route: 'user.update',
          createdBy: "Teste"
        }]
      }

      await new UserService().update(user.id, updateUser, 'Teste')

      assert.ok('O método foi executado com sucesso')
    } catch (error) {
      assert.fail('O método deveria ter sido executado com sucesso na atualização.')
    }
  })

  test('update - ID inválido', async ({ assert }) => {
    try {
      await UserFactory.with('access', 1).create()
      const updateUser = {
        fullname: 'Nome atualizado',
        access: [{
          route: 'user.update',
          createdBy: "Teste"
        }]
      }

      await new UserService().update(1000, updateUser, 'Teste')

      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
      assert.include(error.message, 'not found')
    }
  })

  test('update - Com email existente', async ({ assert }) => {
    try {
      const users = await UserFactory.with('access', 1).createMany(2)
      const updateUser = {
        email: users[1].email,
        access: [{
          route: 'user.update',
          createdBy: "Teste"
        }]
      }

      await new UserService().update(users[0].id, updateUser, 'Teste')

      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
      assert.equal(error.code, '23505')
    }
  })

  test('active', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).create()

    const result = await new UserService().active(user.id, 'Teste')
    assert.exists(result)
    assert.isBoolean(result)
  })

  test('active - ID inválido', async ({ assert }) => {
    try {
      await new UserService().active(1, 'Teste')

      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
      assert.include(error.message, 'not found')
    }
  })

  test('login', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).make()
    const password = user.password

    await user.save()

    const result = await new UserService().login(user.email, password)

    assert.exists(result)
    assert.equal(result.id, user.id)
  })

  test('login - Validação de senha', async ({ assert }) => {
    try {
      const user = await UserFactory.with('access', 1).make()
      const password = user.password
      await user.save()

      await new UserService().login('email', password)

      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
      assert.include(error.message, 'credentials')
    }
  })
})

test.group('Testes Unitários - UsuarioController', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  // Utilização do sinon para mock de métodos.
  group.each.teardown(async () => {
    sinon.restore()
  })

  test('Cadastro sucesso', async ({ assert }) => {
    // Cria um método fake para validação.
    const validateStub = sinon.stub(createUser, 'validate').resolves({
      fullname: 'Teste',
      email: 'teste@gmail.com',
      password: 'teste',
      access: [ 'teste' ]
    })

    // Cria um método fake do serviço de criação.
    const serviceCadastrarStub = sinon.stub(UserService.prototype, 'create').resolves(1)

    const ctx = {
      request: {
        all: () => ({  
          fullname: 'Teste',
          email: 'teste@gmail.com',
          password: 'teste',
          access: ['teste']
        })
      },
      auth: {
        'Authenticate': 'bearer'
      },
      response: {
        status: (code: number) => ({
          send: (data: any) => {
            assert.equal(code, 201)
            assert.isTrue(data.status)
          }
        })
      }
    }

    await new UsersController().create(ctx as unknown as HttpContext)

    assert.isTrue(validateStub.calledOnce)
    assert.isTrue(serviceCadastrarStub.calledOnce)
  })

})
