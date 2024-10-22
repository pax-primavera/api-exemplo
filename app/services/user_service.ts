import CustomException from "#exceptions/custom_exception";
import { ParamsUserInterface, UserInterface } from "#interfaces/user";
import Access from "#models/access";
import User from "#models/user";

/**
 * UserService é uma classe responsável por manipular operações relacionadas aos usuários,
 * incluindo listagem, criação, atualização, ativação e autenticação de usuários.
 */
export default class UserService {
    /**
     * Retorna uma lista de usuários filtrados com base nos parâmetros fornecidos.
     *
     * @param {ParamsUserInterface} params - Parâmetros de filtragem para a consulta de usuários.
     * @returns {Promise<UserInterface[]>} - Uma promessa que resolve para um array de usuários.
     * @throws {CustomException} - Lança uma exceção personalizada em caso de erro.
     */
    public async index(params: ParamsUserInterface): Promise<UserInterface[]> {
        const { fullname, email, active } = params;
        try {
            const users = await User.query().where((query) => {
                if (fullname) {
                    query.whereILike('fullname', `%${fullname}%`);
                }
                if (email) {
                    query.whereILike('email', `%${email}%`);
                }
                if (active !== undefined) {
                    query.where('active', active);
                }
            });

            return users;
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            });
        }
    }

    /**
     * Retorna os detalhes de um usuário específico pelo seu ID.
     *
     * @param {number} id - O ID do usuário a ser buscado.
     * @returns {Promise<UserInterface>} - Uma promessa que resolve para o usuário encontrado.
     * @throws {CustomException} - Lança uma exceção personalizada em caso de erro.
     */
    public async show(id: number): Promise<UserInterface> {
        try {
            const user = await User.findOrFail(id);
            await user.load('access'); // Carrega as permissões de acesso do usuário
            return user;
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            });
        }
    }

    /**
     * Cria um novo usuário com as informações fornecidas.
     *
     * @param {UserInterface} userInfo - Informações do usuário a serem criadas.
     * @param {string} username - O nome do usuário que está criando o novo usuário.
     * @returns {Promise<number>} - Uma promessa que resolve para o ID do usuário criado.
     * @throws {CustomException} - Lança uma exceção personalizada em caso de erro.
     */
    public async create(userInfo: UserInterface, username: string): Promise<number> {
        try {
            const user = await User.create({ ...userInfo, createdBy: username });
            if (userInfo.access) {
                const currentAccesses = userInfo.access.map((access) => {
                    let acc = new Access();
                    acc.route = access.route ?? '';
                    acc.createdBy = username;
                    return acc;
                });
                await user.related('access').saveMany(currentAccesses); // Salva as permissões associadas ao usuário
            }
            return user.id;
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            });
        }
    }

    /**
     * Atualiza as informações de um usuário existente.
     *
     * @param {number} id - O ID do usuário a ser atualizado.
     * @param {UserInterface} userInfo - As novas informações do usuário.
     * @param {string} username - O nome do usuário que está realizando a atualização.
     * @returns {Promise<void>} - Uma promessa que não resolve para nada.
     * @throws {CustomException} - Lança uma exceção personalizada em caso de erro.
     */
    public async update(id: number, userInfo: UserInterface, username: string): Promise<void> {
        try {
            const user = await User.findOrFail(id);
            user.merge({ ...userInfo, updatedBy: username });

            const updatedAccesses = userInfo.access?.map((access) => access.route);
            const currentAccesses = await user.related('access').query();

            const accessesToDelete = currentAccesses.filter((access) => !updatedAccesses?.includes(access.route));

            if (accessesToDelete.length > 0) {
                await user.related('access').query().whereIn('route', accessesToDelete.map((a) => a.route)).delete();
            }

            await user.related('access').updateOrCreateMany(userInfo.access?.map((access) => ({ route: access.route, createdBy: username })) ?? [], 'route');

            await user.save();
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            });
        }
    }

    /**
     * Ativa ou desativa um usuário com base no ID fornecido.
     *
     * @param {number} id - O ID do usuário a ser ativado ou desativado.
     * @param {string} username - O nome do usuário que está realizando a alteração.
     * @returns {Promise<boolean>} - Uma promessa que resolve para o status atual do usuário (ativo/inativo).
     * @throws {CustomException} - Lança uma exceção personalizada em caso de erro.
     */
    public async active(id: number, username: string): Promise<boolean> {
        try {
            const user = await User.findOrFail(id);
            user.active = !user.active; // Alterna o status ativo do usuário
            user.updatedBy = username ?? '';
            await user.save();
            return user.active;
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            });
        }
    }

    /**
     * Realiza a autenticação de um usuário com base no email e senha fornecidos.
     *
     * @param {string} email - O email do usuário a ser autenticado.
     * @param {string} password - A senha do usuário.
     * @returns {Promise<UserInterface>} - Uma promessa que resolve para o usuário autenticado e seu token de acesso.
     * @throws {CustomException} - Lança uma exceção personalizada em caso de erro.
     */
    public async login(email: string, password: string): Promise<UserInterface> {
        try {
            const user = await User.verifyCredentials(email, password); // Verifica as credenciais do usuário
            await user.load('access'); // Carrega as permissões de acesso do usuário
            const token = await User.accessTokens.create(user); // Cria um token de acesso para o usuário

            return {
                ...user.toJSON(),
                token: token.value?.release() // Retorna o usuário com o token de acesso
            };
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            });
        }
    }
}
