# API Exemplo

## Descrição
Breve descrição sobre o que a API faz e seus principais objetivos.

## Instalação

### Pré-requisitos
- Node.js (vXX.X.X)
- NPM ou Yarn

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/nome-do-repositorio.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

## Configuração

### Variáveis de Ambiente

Certifique-se de configurar as variáveis de ambiente necessárias no arquivo `.env`:

```
FILE_LOGS=logs/ # Localização dos arquivos de log
DOC_USER=teste # Usuário para acesso a documentação
DOC_PASSWORD=teste # Senha para acesso a documentação
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=app
```

## Uso

### Iniciar o Servidor

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

### Endpoints

- **GET** `/api/v1/exemplo`

  Descrição do que este endpoint faz.

  **Parâmetros de Requisição:**
  - `parametro1`: Descrição do parâmetro 1 (opcional).

  **Exemplo de Uso:**
  ```bash
  curl -X GET http://localhost:3000/api/v1/exemplo
  ```

### Swagger

A documentação da API é gerada automaticamente usando o Adonis Autoswagger. Para visualizar a documentação:

1. Inicie o servidor (se ainda não estiver rodando):
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

2. Acesse a documentação Swagger em: `http://localhost:3000/docs`

### Configuração

Para configurar o uso é necessário fazer a instalação do `adonis-auto-swagger`

```bash
npm install adonis-autoswagger
# ou
yarn add adonis-autoswagger
```

Após fazer a instalação siga os passos para congfigurar o uso do swagger em sua api:
1. Crie um arquivo swagger.ts no diretório config com o seguinte código
   ```typescript
   // for AdonisJS v6
   import path from "node:path";
   import url from "node:url";
   // ---

   export default {
   // path: __dirname + "/../", for AdonisJS v5
   path: path.dirname(url.fileURLToPath(import.meta.url)) + "/../", // for AdonisJS v6
   title: "Foo", // use info instead
   version: "1.0.0", // use info instead
   description: "", // use info instead
   tagIndex: 2,
   info: {
      title: "title",
      version: "1.0.0",
      description: "",
   },
   snakeCase: true,

   debug: false, // set to true, to get some useful debug output
   ignore: ["/swagger", "/docs"],
   preferredPutPatch: "PUT", // if PUT/PATCH are provided for the same route, prefer PUT
   common: {
      parameters: {}, // OpenAPI conform parameters that are commonly used
      headers: {}, // OpenAPI conform headers that are commonly used
   },
   securitySchemes: {}, // optional
   authMiddlewares: ["auth", "auth:api"], // optional
   defaultSecurityScheme: "BearerAuth", // optional
   persistAuthorization: true, // persist authorization between reloads on the swagger page
   showFullPath: false, // the path displayed after endpoint summary
   };
   ```
   OBS: Esse código pode ser totalmente manipulado para atender aos requisitos do sistema.

2. Agora adicione os comentários nos controllers de uso. Este é um exemplo para uma rota de busca.
   ```typescript
   /**
     * @index 
     * @summary Buscar usuários
     * 
     * @operationId Busca
     * @tag Usuário
     * 
     * @paramQuery fullname - Nome do usuário - @type(string)
     * @paramQuery email - Email do usuário - @type(string)
     * @paramQuery active - Indica se vai buscar os usuários ativos ou inativos (OBS: Quando não informado o endpoint trará todos) - @type(boolean)
     * 
     * @responseBody 200 - <ResponseAll> - Busca todos os usuários de acordo com os parâmetros informados
     * @responseBody 400 - {status: false, message: "Falha ao processar requisição!", data: {}}
     * @responseBody 401 - {status: false, message: "Usuário não autenticado!", data: {}}
     * @responseBody 403 - {status: false, message: "Usuário não possui permissão de acesso ao recurso!", data: {}}
     * @responseBody 500 - {status: false, message: "Falha interna do servidor! Contate o suporte.", data: {}}
     */
   ``` 

3. Por fim basta configurar o enpoint de acesso a documentação no arquivo `start/routes.ts`
   ```typescript
   import AutoSwagger from "adonis-autoswagger";
   import swagger from "#config/swagger";
   import { middleware } from './kernel.js'

   // Rota para visualização do JSON da documentação. (Opcional)
   router.get("/swagger", async () => {
      return AutoSwagger.default.docs(router.toJSON(), swagger);
   })

   // Rota de visualização da documentação. (Obrigatória)
   router.get("/docs", async () => {
      return AutoSwagger.default.ui("/swagger", swagger);
   })
   ```

## Testes

A API utiliza testes unitários e de integração com Sinon para garantir a robustez e correção do código.

### Rodar Testes

Para executar os testes:

```bash
npm test
# ou
yarn test
```

## Estrutura de Diretórios
```
app/
├── controllers/   # Controladores responsáveis por gerenciar o fluxo de dados e ações nos endpoints da API.
├── exceptions/    # Exceções personalizadas para tratamento de erros e respostas consistentes.
├── integration/   # Integração com serviços ou APIs externas.
├── interfaces/    # Definições de contratos e tipos utilizados no projeto.
├── middleware/    # Middlewares para autenticação, autorização, entre outros processos.
├── models/        # Modelos que representam a estrutura de dados no banco de dados.
├── services/      # Camada de serviços com a lógica de negócios do sistema.
├── utils/         # Funções utilitárias usadas em diversas partes do sistema.
├── validators/    # Validações de inputs e regras de dados.
│
├── logs/          # Arquivos de logs da aplicação.
├── config/        # Configurações globais da aplicação.
├── tests/         # Testes automatizados do sistema.
├── start/         # Arquivos de inicialização e configuração do servidor.
├── database/      
│   ├── factories/  # Fábricas para criação de dados falsos para testes.
│   ├── migrations/ # Arquivos de migração para criação e alteração de tabelas no banco de dados.
│   └── seeders/    # Arquivos de seeders para popular o banco de dados com dados iniciais.
```
## Logger

O projeto utiliza o logger do Adonis para registrar eventos e depuração.

## Middlewares

## Middlewares

Nesta seção, apresentamos os middlewares utilizados na aplicação, juntamente com uma breve descrição de suas funções e os arquivos correspondentes.

## Middlewares

### 1. access_middleware
- **Descrição**: Este middleware verifica se o usuário tem acesso aos recursos solicitados. Ele é utilizado para garantir que apenas usuários autorizados possam acessar determinadas rotas da aplicação.
- **Arquivo**: `app/middleware/access_middleware.ts`

### api_auth_middleware

- **Descrição:** Middleware de autenticação para acesso à API. Este middleware requer que um cabeçalho com credenciais seja incluído em cada requisição para acessar as rotas da API.
- **Arquivo:** `app/middleware/api_auth_middleware.ts`
  
  **Cabeçalho necessário:**
  - **Chave:** X-Credentials
  - **Valor:** Deve ser o valor da variável `APP_KEY` definido no arquivo `.env`.

  Ele verifica se o cabeçalho de autenticação está presente e se as credenciais correspondem ao valor da variável de ambiente. Se não estiverem, uma exceção de não autorizado será lançada.

### 3. auth_middleware
- **Descrição**: Este middleware é utilizado para autenticação geral de usuários. Ele valida credenciais e garante que o usuário esteja autenticado antes de acessar as rotas protegidas. É comumente usado em rotas que exigem login.
- **Arquivo**: `app/middleware/auth_middleware.ts`

### 4. docs_auth_middleware
- **Descrição**: O `docs_auth_middleware` é um middleware que protege as rotas que geram documentação da API. Ele verifica se o usuário tem permissão para acessar a documentação, garantindo que apenas usuários autorizados possam visualizar informações sensíveis sobre a API.
- **Arquivo**: `app/middleware/docs_auth_middleware.ts`



## Exceptions

Tratamento de exceções personalizado para melhor controle de erros na API.