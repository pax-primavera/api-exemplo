import UnauthorizedException from '#exceptions/unauthorized_exception'
import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/** -- Autenticação para acessar a api --
 * 
 * Essa classe serve para autenticar o acesso da api.
 * Ao tentar acessar alguma rota deve ser passado o cabeçalho
 * 
 * key: X-Credentials
 * 
 * value: ********
 */
export default class ApiAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Verifica se a credencial foi passada no header!
    const authHeader = ctx.request.header('X-Credentials')
    
    if (!authHeader) {
      throw new UnauthorizedException('Acesso a API não autorizado!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    // Necessário configurar as váriaveis de ambiente no arquivo .env
    if (authHeader === env.get('APP_KEY')) {
      await next()
    } else {
      throw new UnauthorizedException('Credencial inválida!', { status: 401, code: 'E_UNAUTHORIZED' })
    }
  }
}