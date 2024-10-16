import { UserInterface } from '#interfaces/user';
import UserService from '#services/user_service';
import { createUser, login, updateUser } from '#validators/user';
import { type HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    private service: UserService;

    constructor() {
        this.service = new UserService()
    }

    /**
     * @index 
     * @summary Buscar usuários
     * 
     * @operationId Busca
     * @tag Usuário
     * 
     * @paramQuery fullname - Nome do usuário - @type(string)
     * @paramQuery email - Email do usuário - @type(string)
     * @paramQuery active - Indica se vai buscar os usuários ativos ou inativos (OBS: Quando não informado o endpoint trará todos) - @type(boolean)
     * 
     * @responseBody 200 - <UsersResponse> - Busca todos os usuários de acordo com os parâmetros informados
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição", data: {}}
     */
    public async index({ request, response }: HttpContext) {
        const params = request.qs()
        const result: UserInterface[] = await this.service.index(params)
        return response.status(200).send({
            status: true,
            message: `${result.length} registros encontrados!`,
            data: result
        })
    }

    /**
     * @show 
     * @summary Buscar usuário pelo ID.
     * 
     * @operationId Busca por ID
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number)
     * 
     * @responseBody 200 - <UserResponse> - Busca o usuário de acordo com o id informado.
     * @responseBody 404 - {status: false, message: "Falha ao processar requisição", data: {}}
     */
    public async show({ params, response }: HttpContext) {
        const result: UserInterface = await this.service.show(params.id)
        return response.status(200).send({
            status: true,
            message: `Registro encontrado!`,
            data: result
        })
    }

    /**
     * @create 
     * @summary Rota de busca dos dados de um usuário pelo id.
     * 
     * @operationId Cadastrar
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number)
     * 
     * @responseBody 200 - <UserResponse> - Busca o usuário de acordo com o id informado.
     * @responseBody 404 - {status: false, message: "Falha ao processar requisição", data: {}}
     */
    public async create({ request, response, auth }: HttpContext) {
        const data = await createUser.validate(request.all())
        const userInfo: UserInterface = {
            ...data,
            access: data.access.map((item) => { return { route: item } })
        };

        const result: number = await this.service.create(userInfo, auth.user?.fullname ?? '')
        return response.status(201).send({
            status: true,
            message: `Registro cadastrado com sucesso!`,
            data: result
        })
    }

    /**
     * @update 
     * @summary Rota de busca dos dados de um usuário pelo id.
     * 
     * @operationId Atualizar
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number)
     * 
     * @responseBody 200 - <UserResponse> - Busca o usuário de acordo com o id informado.
     * @responseBody 404 - {status: false, message: "Falha ao processar requisição", data: {}}
     */
    public async update({ request, params, response, auth }: HttpContext) {
        const { id } = params
        const data = await updateUser.validate(request.all())
        const userInfo: UserInterface = {
            ...data,
            access: data.access.map((item) => { return { route: item } })
        };

        await this.service.update(id, userInfo, auth.user?.fullname ?? '')

        return response.status(204).send({
            status: true,
            message: `Registro atualizado com sucesso!`,
            data: null
        })
    }

    /**
     * @active 
     * @summary Rota de busca dos dados de um usuário pelo id.
     * 
     * @operationId Ativar
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number)
     * 
     * @responseBody 200 - <UserResponse> - Busca o usuário de acordo com o id informado.
     * @responseBody 404 - {status: false, message: "Falha ao processar requisição", data: {}}
     */
    public async active({ params, response, auth }: HttpContext) {
        const { id } = params
        const active = await this.service.active(id, auth.user?.fullname ?? '')

        return response.status(204).send({
            status: true,
            message: `Registro ${active ? 'ativado' : 'inativado'} com sucesso!`,
            data: null
        })
    }

    /**
     * @login 
     * @summary Rota de busca dos dados de um usuário pelo id.
     * 
     * @operationId Login
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number)
     * 
     * @responseBody 200 - <UserResponse> - Busca o usuário de acordo com o id informado.
     * @responseBody 404 - {status: false, message: "Falha ao processar requisição", data: {}}
     */
    public async login({ request, response }: HttpContext) {
        const { email, password } = await login.validate(request.all())

        const result: UserInterface = await this.service.login(email, password)
        return response.status(201).send({
            status: true,
            message: `Usuário autenticado com sucesso!`,
            data: result
        })
    }
}