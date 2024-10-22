import UsersController from '#controllers/users_controller'
import { UserFactory } from '#database/factories/user_factory'
import UserService from '#services/user_service'
import { createUser } from '#validators/user'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import sinon from 'sinon'

/** 
 * Grupo de Testes Unitários para o UserService
 * 
 * Este grupo de testes verifica as funcionalidades do UserService, incluindo
 * a indexação, criação, atualização, ativação e login de usuários.
 */
test.group('Testes Unitários - UsuarioService', (group) => {
  
  // Configuração para iniciar uma transação e executar o rollback a cada teste realizado.
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  /** 
   * Teste para listar usuários
   * 
   * Este teste verifica se o método index retorna usuários corretamente.
   */
  test('index', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).create()
    const result = await new UserService().index({})

    assert.exists(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].id, user.id)
  })

  /** 
   * Teste para busca vazia
   * 
   * Este teste verifica se o método index retorna um array vazio quando não há usuários.
   */
  test('index - Busca vazia', async ({ assert }) => {
    const result = await new UserService().index({})
    assert.exists(result)
    assert.equal(result.length, 0)
  })

  /** 
   * Teste para busca com parâmetros
   * 
   * Este teste verifica se o método index retorna o usuário correto ao buscar por nome.
   */
  test('index - Busca com parâmetros', async ({ assert }) => {
    const users = await UserFactory.with('access').createMany(3)
    const result = await new UserService().index({ fullname: users[0].fullname })

    assert.exists(result)
    assert.equal(result.length, 1)
    assert.equal(result[0].id, users[0].id)
  })

  /** 
   * Teste para exibir usuário
   * 
   * Este teste verifica se o método show retorna o usuário correto baseado no ID.
   */
  test('show', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).create()
    const result = await new UserService().show(user.id)

    assert.exists(result)
    assert.equal(result.id, user.id)
  })

  /** 
   * Teste para ID inválido na busca de usuário
   * 
   * Este teste verifica se o método show lança um erro ao tentar buscar um usuário com ID inválido.
   */
  test('show - ID inválido', async ({ assert }) => {
    try {
      await new UserService().show(123)
      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
      assert.include(error.message, 'not found')
    }
  })

  /** 
   * Teste para criação de usuário
   * 
   * Este teste verifica se o método create salva um novo usuário corretamente.
   */
  test('create', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).make()
    const result = await new UserService().create(user, 'Teste')

    assert.exists(result)
    assert.equal(result, user.id)
  })

  /** 
   * Teste para falha de validação na criação de usuário
   * 
   * Este teste verifica se o método create lança um erro de validação quando os dados são inválidos.
   */
  test('create - Falha de validação', async ({ assert }) => {
    try {
      let user = { fullname: 'Teste' }
      await new UserService().create(user, 'teste')
      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
    }
  })

  /** 
   * Teste para atualização de usuário
   * 
   * Este teste verifica se o método update atualiza os dados do usuário corretamente.
   */
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

  /** 
   * Teste para ID inválido na atualização de usuário
   * 
   * Este teste verifica se o método update lança um erro ao tentar atualizar um usuário com ID inválido.
   */
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

  /** 
   * Teste para atualização de usuário com email existente
   * 
   * Este teste verifica se o método update lança um erro ao tentar atualizar um usuário para um email que já existe.
   */
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
      assert.equal(error.code, '23505') // Código de erro para violação de restrição única
    }
  })

  /** 
   * Teste para ativação de usuário
   * 
   * Este teste verifica se o método active ativa um usuário corretamente.
   */
  test('active', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).create()

    const result = await new UserService().active(user.id, 'Teste')
    assert.exists(result)
    assert.isBoolean(result)
  })

  /** 
   * Teste para ID inválido na ativação de usuário
   * 
   * Este teste verifica se o método active lança um erro ao tentar ativar um usuário com ID inválido.
   */
  test('active - ID inválido', async ({ assert }) => {
    try {
      await new UserService().active(1, 'Teste')

      assert.fail('O método não deveria ter retornado sucesso com um ID inválido')
    } catch (error) {
      assert.exists(error)
      assert.include(error.message, 'not found')
    }
  })

  /** 
   * Teste de login de usuário
   * 
   * Este teste verifica se o método login autentica um usuário corretamente.
   */
  test('login', async ({ assert }) => {
    const user = await UserFactory.with('access', 1).make()
    const password = user.password

    await user.save()

    const result = await new UserService().login(user.email, password)

    assert.exists(result)
    assert.equal(result.id, user.id)
  })

  /** 
   * Teste para validação de senha durante o login
   * 
   * Este teste verifica se o método login lança um erro ao tentar autenticar com credenciais inválidas.
   */
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

/** 
 * Grupo de Testes Unitários para o UsersController
 * 
 * Este grupo de testes verifica as funcionalidades do UsersController, incluindo
 * o cadastro de usuários.
 */
test.group('Testes Unitários - UsuarioController', (group) => {
  
  // Configuração para iniciar uma transação e executar o rollback a cada teste realizado.
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
    return () => db.rollbackGlobalTransaction()
  })

  // Utilização do sinon para mock de métodos.
  group.each.teardown(async () => {
    sinon.restore()
  })

  /** 
   * Teste para cadastro de usuário com sucesso
   * 
   * Este teste verifica se o método create do UsersController cadastra um usuário corretamente.
   */
  test('Cadastro sucesso', async ({ assert }) => {
    // Cria um método fake para validação.
    const validateStub = sinon.stub(createUser, 'validate').resolves({
      fullname: 'Teste',
      email: 'teste@gmail.com',
      password: 'teste',
      access: ['teste']
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