import UnauthorizedException from '#exceptions/unauthorized_exception'
import Access from '#models/access'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/** -- Autorização de acesso --
 * 
 * Essa classe serve para autorizar o acesso a um recurso (rota). Isso é feito através
 * do token passado pela rota. contendo os dados do usuário.
 * 
 * OBS: Essa middleware pode ser agrupada com a middleware de autenticação. Foi separado para permitir a dinamização dos acessos,
 * caso uma rota que exija o token mas não precise de uma validação de acesso. A regra pode ser tratada da forma como o sistema será construido.
 * 
 */
export default class AcessMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Aqui dentro vai sua regra de acesso aos recursos da api, podendo ser totalmente manipulado para atender os requisitos do sistema.
    const auth = ctx.auth

    if (!auth) { // Verifica se o usuário está autenticado!
      throw new UnauthorizedException('Não autenticado!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    try { // Verifica se o token informado é válido!
      await auth.authenticate()
    } catch (error) {
      throw new UnauthorizedException('Token inválido!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    const user = auth.user

    if (!auth.user) { // Verifica se no conteúdo do token possui as informações do usuário!
      throw new UnauthorizedException('Informações de usuário inválidas!', { status: 401, code: 'E_UNAUTHORIZED' })
    }

    try {
      // Busca no banco de dadosse o usuário possui autorização na rota informada!
      await Access.query().where({
        route: ctx.route?.name,
        userId: user?.id
      }).firstOrFail()

      await next()
    } catch (error) {
      throw new UnauthorizedException('Não autorizado!', { status: 403, code: 'E_FORBIDDEN' })
    }
  }
}