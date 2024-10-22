import UnauthorizedException from '#exceptions/unauthorized_exception'
import Access from '#models/access'
import type { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'

/** 
 * Middleware de Autorização de Acesso.
 * 
 * Esta classe serve para autorizar o acesso a um recurso (rota) com base nas permissões
 * do usuário, utilizando o token passado na requisição. O middleware verifica se o usuário 
 * está autenticado e se possui as permissões necessárias para acessar a rota requisitada.
 * 
 * OBS: Essa middleware pode ser combinada com a middleware de autenticação. Foi separada 
 * para permitir a dinamização dos acessos, permitindo que uma rota exija um token sem 
 * necessariamente necessitar de uma validação de acesso.
 */
export default class AccessMiddleware {
  /**
   * Manipulador principal do middleware.
   *
   * @param ctx - O contexto da requisição HTTP, que contém informações sobre o usuário, 
   *              autenticação e a rota requisitada.
   * @param next - Função que chama o próximo middleware na pilha.
   * 
   * @throws UnauthorizedException - Lança uma exceção se o usuário não estiver autenticado,
   *                                  se o token for inválido, ou se o usuário não tiver 
   *                                  as permissões necessárias para acessar a rota.
   */
  async handle(ctx: HttpContext, next: NextFn) {
    const auth = ctx.auth

    // Verifica se o usuário está autenticado.
    if (!auth) {
      throw new UnauthorizedException('Não autenticado!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    try {
      // Verifica se o token informado é válido.
      await auth.authenticate()
    } catch (error) {
      throw new UnauthorizedException('Token inválido!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    const user = auth.user

    // Verifica se as informações do usuário estão presentes no token.
    if (!user) {
      throw new UnauthorizedException('Informações de usuário inválidas!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    try {
      // Busca no banco de dados se o usuário possui autorização para a rota informada.
      await Access.query().where({
        route: ctx.route?.name,
        userId: user.id
      }).firstOrFail()

      // Chama o próximo middleware na pilha.
      await next()
    } catch (error) {
      throw new UnauthorizedException('Não autorizado!', { status: 403, code: 'E_FORBIDDEN' })
    }
  }
}
