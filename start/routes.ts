import router from '@adonisjs/core/services/router'

/** -- Documentação/Importação --
 * Para utilizar o auto-swagger modelo de documentação automática de api deve seguir o padrão informado na documentação para importação das controllers
 * const DashboardController = () => import('#controllers/dashboard_controller')
 */
const UsersController = () => import('#controllers/users_controller')

/** -- Documentação --
 * Para habilitar a documentação com a utilização do swagger deve importar o pacote e o arquivo de configurações.
 * Após esse processo deve criar as rotas de acesso do swagger. OBS: é possível habilitar a autenticação para as rotas de documentação.
 */
import AutoSwagger from "adonis-autoswagger";
import swagger from "#config/swagger";
import { middleware } from './kernel.js'

// Rota para visualização do JSON da documentação. (Opcional)
router.get("/swagger", async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
}).use(middleware.docsAuth())

// Rota de visualização da documentação. (Obrigatória)
router.get("/docs", async () => {
  return AutoSwagger.default.ui("/swagger", swagger);
  /** É possível mudar a forma de visualização da documentação para isso basta subtituir o método default utilizado.
   * return AutoSwagger.default.scalar("/swagger");
   * return AutoSwagger.default.rapidoc("/swagger", "view");
   */
}).use(middleware.docsAuth())

/** -- Agrupamento de rotas --
 * Cada grupo de rotas é indexado para um controller especifico, para facilitar a
 * manutenção de código, e também separa melhor as funcionalidades em cada arquivo.
 * 
 * Os padrões dos verbos http seguem as diretrizes de padronização.
 */
router.group(() => {
  router.post('/login', [UsersController, 'login']).as('login')

  // Todas as rotas que possuem parâmetros obrigatórios devem ser validados através do método where, garantindo o funcionamento e integridade da api.
  router.group(() => {
    router.get('/', [UsersController, 'index']).as('user.index')
    router.get('/:id', [UsersController, 'show']).where('id', router.matchers.number()).as('user.show')

    router.post('/', [UsersController, 'create']).as('user.create')

    router.put('/:id', [UsersController, 'update']).where('id', router.matchers.number()).as('user.update')

    router.patch('/:id', [UsersController, 'active']).where('id', router.matchers.number()).as('user.active')
    // Caso o sistema não utilize ativação/inativação, e sim a exclusão de registros, trocar o verbo para delete
    // router.delete('/:id', [UsersController, 'delete']).where('id', router.matchers.number()) 
  }).prefix('user').use(middleware.auth())
}).prefix('api/v1').use([middleware.apiAuth()]).as('api')