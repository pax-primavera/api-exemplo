import UnauthorizedException from '#exceptions/unauthorized_exception'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/** 
 * Middleware de Autenticação para Acesso à API.
 * 
 * Esta classe serve para autenticar o acesso à API. Para acessar qualquer rota,
 * deve-se incluir um cabeçalho com as credenciais apropriadas.
 * 
 * **Cabeçalho necessário:**
 * - **Chave:** X-Credentials
 * - **Valor:** ******** (deve ser o valor da variável APP_KEY definido no arquivo .env)
 */
export default class ApiAuthMiddleware {
  /**
   * Manipulador principal do middleware.
   *
   * @param ctx - O contexto da requisição HTTP, que contém informações sobre a requisição,
   *              como cabeçalhos e parâmetros.
   * @param next - Função que chama o próximo middleware na pilha.
   * 
   * @throws UnauthorizedException - Lança uma exceção se as credenciais não forem fornecidas
   *                                  ou se as credenciais forem inválidas.
   */
  async handle(ctx: HttpContext, next: NextFn) {
    // Verifica se a credencial foi passada no cabeçalho.
    const authHeader = ctx.request.header('X-Credentials')
    
    // Se o cabeçalho de autenticação não estiver presente, lança uma exceção.
    if (!authHeader) {
      throw new UnauthorizedException('Acesso à API não autorizado!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    // Compara o cabeçalho de autenticação com a variável de ambiente APP_KEY.
    // Necessário configurar as variáveis de ambiente no arquivo .env
    if (authHeader === env.get('APP_KEY')) {
      // Se as credenciais estiverem corretas, chama o próximo middleware.
      await next()
    } else {
      // Se as credenciais forem inválidas, lança uma exceção.
      throw new UnauthorizedException('Credencial inválida!', { status: 401, code: 'E_UNAUTHORIZED' })
    }
  }
}
