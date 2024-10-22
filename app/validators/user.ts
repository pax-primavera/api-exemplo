import User from '#models/user'
import vine from '@vinejs/vine'

/**
 * Validação para a rota de criação de usuário.
 * - O nome completo, email, senha e acessos são obrigatórios.
 * - O email deve ser único no sistema, utilizando uma verificação assíncrona no banco de dados.
 * - A lista de acessos não pode ser vazia e não pode conter valores duplicados.
 */
export const createUser = vine.compile(
    vine.object({
        fullname: vine.string(),  // O nome completo do usuário é obrigatório e deve ser uma string.
        email: vine.string().email().unique(async (_db, value) => {
            /**
             * Validação de unicidade de email.
             * - Executa uma consulta ao banco de dados para verificar se o email já existe.
             * - A consulta é feita utilizando o ORM para maior flexibilidade e facilidade de manutenção.
             * 
             * @param _db - Instância do banco de dados (não utilizada aqui, mas disponível).
             * @param value - O valor do email a ser validado.
             * @returns - Retorna `true` se o email for único, caso contrário `false`.
             */
            const user = await User.query().where('email', value).first()
            return !user  // Se não houver usuário com o mesmo email, a validação passa.
        }),
        password: vine.string(),  // Senha obrigatória.
        
        access: vine.array(  // Lista de acessos obrigatória.
            vine.string()  // Cada acesso deve ser uma string.
        ).notEmpty()       // A lista de acessos não pode ser vazia.
         .distinct()       // A lista de acessos não pode conter valores repetidos.
    })
)

/**
 * Validação para a rota de atualização de usuário.
 * - Os campos são opcionais, permitindo atualizações parciais.
 * - O email, se fornecido, é validado como único, exceto para o próprio usuário.
 * - A lista de acessos não pode ser vazia e não pode conter valores duplicados.
 */
export const updateUser = vine.compile(
    vine.object({
        fullname: vine.string().optional(),  // Nome completo é opcional na atualização.
        
        email: vine.string().email().unique(async (_db, value, field) => {
            /**
             * Validação de unicidade de email, considerando o próprio usuário.
             * - Verifica se o email já está sendo utilizado por outro usuário.
             * - Exclui o próprio usuário da validação usando o campo `userId` da meta do validador.
             * 
             * @param _db - Instância do banco de dados (não utilizada aqui, mas disponível).
             * @param value - O valor do email a ser validado.
             * @param field - Contém informações adicionais, incluindo a meta com o `userId`.
             * @returns - Retorna `true` se o email for único ou pertence ao próprio usuário.
             */
            const user = await User.query()
                .where('email', value)
                .andWhereNot('id', field.meta.userId)  // Exclui o próprio usuário da validação.
                .first()
            return !user  // Se o email for único, a validação passa.
        }).optional(),  // Email é opcional na atualização.
        
        password: vine.string().optional(),  // Senha é opcional na atualização.
        
        access: vine.array(  // Lista de acessos obrigatória.
            vine.string()  // Cada acesso deve ser uma string.
        ).notEmpty()       // A lista de acessos não pode ser vazia.
         .distinct()       // A lista de acessos não pode conter valores repetidos.
    })
)

/**
 * Validação para a rota de login.
 * - O email e a senha são obrigatórios.
 * - O email deve ser válido.
 */
export const login = vine.compile(
    vine.object({
        email: vine.string().email(),  // Email obrigatório e deve ser válido.
        password: vine.string()        // Senha obrigatória.
    })
)
