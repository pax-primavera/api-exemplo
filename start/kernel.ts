/*
|--------------------------------------------------------------------------
| HTTP kernel file
|--------------------------------------------------------------------------
|
| The HTTP kernel file is used to register the middleware with the server
| or the router.
|
*/

import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

/**
 * The error handler is used to convert an exception
 * to a HTTP response.
 */
server.errorHandler(() => import('#exceptions/handler'))

/**
 * The server middleware stack runs middleware on all the HTTP
 * requests, even if there is no route registered for
 * the request URL.
 */
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

/**
 * The router middleware stack runs middleware on all the HTTP
 * requests with a registered route.
 */
router.use([() => import('@adonisjs/core/bodyparser_middleware'), () => import('@adonisjs/auth/initialize_auth_middleware')])

/**
 * Named middleware collection must be explicitly assigned to
 * the routes or the routes group.
 */
export const middleware = router.named({
  /** Middleware de validação de acesso
   * 
   * Tem como objetivo validar se o usuário autenticado possui permissão para consumir o enpoint determinado.
   * @returns 
   */
  access: () => import('#middleware/access_middleware'),
  /** Middleware de autenticação
   * 
   * Tem como objetivo validar se o usuário está autenticado.
   * @returns 
   */
  auth: () => import('#middleware/auth_middleware'),
  /** Middleware de autorização a api.
   * 
   * Tem como objetivo autorizar o acesso aos enpoints da api. 
   * @returns 
   */
  apiAuth: () => import('#middleware/api_auth_middleware'),
  /** Middleware de autenticação a documentação
   * 
   * Tem como objetivo autorizar o acesso a documentação dos endpoints. 
   * @returns 
   */
  docsAuth: () => import('#middleware/docs_auth_middleware')
})
