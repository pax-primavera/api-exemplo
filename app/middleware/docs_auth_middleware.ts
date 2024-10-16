import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/** -- Autenticação para a documentação --
 * 
 * Essa classe serve para autenticar o acesso a documentação da api, utilizando o método Basic padrão.
 */
export default class DocsAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Verifica se as informações de autenticação foram passadas.
    const authHeader = ctx.request.header('authorization')

    if (!authHeader) {
      ctx.response.header('WWW-Authenticate', 'Basic')
      return ctx.response.status(401).send('Authorization required')
    }

    // Converte as informações passadas de base64 para um formato legivel!
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    // Valida se as informações passadas estão corretas!
    // OBS: Necessário configurar as váriaveis de ambiente no arquivo .env
    if (username === env.get('DOC_USER') && password === env.get('DOC_PASSWORD')) {
      await next()
    } else {
      ctx.response.header('WWW-Authenticate', 'Basic')
      return ctx.response.status(401).send('Invalid credentials')
    }
  }
}