import { UserInterface } from '#interfaces/user';
import UserService from '#services/user_service';
import { createUser, login, updateUser } from '#validators/user';
import { type HttpContext } from '@adonisjs/core/http'

export default class UsersController {
    private service: UserService;
    
    /** Instância o serviço com a regra de negócio a ser utilizada 
     * 
     */
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
     * @responseBody 200 - <ResponseAll> - Busca todos os usuários de acordo com os parâmetros informados
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição!", data: {}}
     * @responseBody 401 - {status: false, message: "Usuário não autenticado!", data: {}}
     * @responseBody 403 - {status: false, message: "Usuário não possui permissão de acesso ao recurso!", data: {}}
     * @responseBody 500 - {status: false, message: "Falha interna do servidor! Contate o suporte.", data: {}}
     */
    public async index({ request, response }: HttpContext) {
        const params = request.qs()
        const result: UserInterface[] = await this.service.index(params)
        return response.status(200).send({
            status: true,
            message: `${result.length == 1? result.length + 'registro encontrado!' : result.length + 'registros encontrados!' }`,
            data: result
        })
    }

    /**
     * @show 
     * @summary Buscar usuário pelo ID
     * 
     * @operationId Busca por ID
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number) @required
     * 
     * @responseBody 200 - <ResponseById> - Busca o usuário de acordo com o parâmetro informado.
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição!", data: {}}
     * @responseBody 401 - {status: false, message: "Usuário não autenticado!", data: {}}
     * @responseBody 403 - {status: false, message: "Usuário não possui permissão de acesso ao recurso!", data: {}}
     * @responseBody 404 - {status: false, message: "Usuário não localizado!", data: {}}
     * @responseBody 500 - {status: false, message: "Falha interna do servidor! Contate o suporte.", data: {}}
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
     * @summary Cadastrar um novo usuário
     * 
     * @operationId Cadastrar
     * @tag Usuário
     * 
     * @requestBody <createUser>
     * 
     * @responseBody 201 - <ResponseCreate> - Cadastra um novo usuário com as informações passadas.
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição!", data: {}}
     * @responseBody 401 - {status: false, message: "Usuário não autenticado!", data: {}}
     * @responseBody 403 - {status: false, message: "Usuário não possui permissão de acesso ao recurso!", data: {}}
     * @responseBody 500 - {status: false, message: "Falha interna do servidor! Contate o suporte.", data: {}}
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
     * @summary Ativar/Inativar um usuário
     * 
     * @operationId Atualizar
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number) @required
     *
     * 
     * @responseBody 204 - <ResponseUpdate> - Atualiza os dados do usuário de acordo com o ID informado.
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição!", data: {}}
     * @responseBody 401 - {status: false, message: "Usuário não autenticado!", data: {}}
     * @responseBody 403 - {status: false, message: "Usuário não possui permissão de acesso ao recurso!", data: {}}
     * @responseBody 404 - {status: false, message: "Usuário não localizado!", data: {}}
     * @responseBody 500 - {status: false, message: "Falha interna do servidor! Contate o suporte.", data: {}}
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
     * @summary Atualizar os dados de um usuário
     * 
     * @operationId Ativar
     * @tag Usuário
     * 
     * @paramPath id - ID do usuário - @type(number) @required
     * 
     * @requestBody <updateUser>
     * 
     * @responseBody 204 - <ResponseUpdate> - Ativa/Inativa o usuário de acordo com o ID informado.
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição!", data: {}}
     * @responseBody 401 - {status: false, message: "Usuário não autenticado!", data: {}}
     * @responseBody 403 - {status: false, message: "Usuário não possui permissão de acesso ao recurso!", data: {}}
     * @responseBody 404 - {status: false, message: "Usuário não localizado!", data: {}}
     * @responseBody 500 - {status: false, message: "Falha interna do servidor! Contate o suporte.", data: {}}
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
     * @summary Login de usuário
     * 
     * @operationId Login
     * @tag Usuário
     * 
     * @requestBody <login>
     * 
     * @responseBody 200 - <ResponseById> - Retorna os dados do usuário autenticado.
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição!", data: {}}
     * @responseBody 401 - {status: false, message: "Usuário não autenticado!", data: {}}
     * @responseBody 403 - {status: false, message: "Usuário não possui permissão de acesso ao recurso!", data: {}}
     * @responseBody 404 - {status: false, message: "Usuário não localizado!", data: {}}
     * @responseBody 500 - {status: false, message: "Falha interna do servidor! Contate o suporte.", data: {}}
     */
    public async login({ request, response }: HttpContext) {
        const { email, password } = await login.validate(request.all())

        const result: UserInterface = await this.service.login(email, password)
        return response.status(200).send({
            status: true,
            message: `Usuário autenticado com sucesso!`,
            data: result
        })
    }
}