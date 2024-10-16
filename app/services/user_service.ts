import CustomException from "#exceptions/custom_exception";
import { ParamsUserInterface, UserInterface } from "#interfaces/user";
import Access from "#models/access";
import User from "#models/user";

export default class UserService {
    public async index(params: ParamsUserInterface): Promise<UserInterface[]> {
        const { fullname, email, active } = params
        try {
            const users = await User.query().where((query) => {
                if (fullname) {
                    query.whereILike('fullname', `%${fullname}%`)
                }
                if (email) {
                    query.whereILike('email', `%${email}%`)
                }
                if (active !== undefined) {
                    query.where('active', active)
                }
            })

            return users
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            })
        }
    }

    public async show(id: number): Promise<UserInterface> {
        try {
            const user = await User.findOrFail(id)
            user.load('access')
            return user
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            })
        }
    }

    public async create(userInfo: UserInterface, username: string): Promise<number> {
        try {
            const user = await User.create({ ...userInfo, createdBy: username })
            if (userInfo.access) {
                const currentAccesses = userInfo.access.map((access) => {
                    let acc = new Access()
                    acc.route = access.route ?? '',
                        acc.createdBy = username
                    return acc
                })
                await user.related('access').saveMany(currentAccesses)
            }
            return user.id
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            })
        }
    }

    public async update(id: number, userInfo: UserInterface, username: string): Promise<void> {
        try {
            const user = await User.findOrFail(id)
            user.merge({ ...userInfo, updatedBy: username })

            const updatedAccesses = userInfo.access?.map((access) => access.route)

            const currentAccesses = await user.related('access').query()

            const accessesToDelete = currentAccesses.filter((access) => !updatedAccesses?.includes(access.route))

            if (accessesToDelete.length > 0) {
                await user.related('access').query().whereIn('route', accessesToDelete.map((a) => a.route)).delete()
            }

            await user.related('access').updateOrCreateMany(userInfo.access?.map((access) => { return { route: access.route, createdBy: username } }) ?? [], 'route')

            await user.save()
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            })
        }
    }

    public async active(id: number, username: string): Promise<boolean> {
        try {
            const user = await User.findOrFail(id)
            user.active = !user.active
            user.updatedBy = username ?? ''
            await user.save()
            return user.active
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            })
        }
    }

    public async login(email: string, password: string): Promise<UserInterface> {
        try {
            const user = await User.verifyCredentials(email, password)
            user.load('access')
            const token = await User.accessTokens.create(user)

            return {
                ...user.toJSON(),
                token: token.value?.release()
            }
        } catch (error) {
            throw new CustomException(error.message ?? 'Erro de execução', {
                status: error.status ?? 500,
                code: error.code ?? 'E_RUNTIME_EXCEPTION',
                cause: error
            })
        }
    }
}