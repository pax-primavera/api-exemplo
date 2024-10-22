import axios, { AxiosRequestConfig } from 'axios'

export default class ApiService {
    private baseUrl: string
    private defaultHeaders: Record<string, string>

    /**
     * Constrói uma instância do serviço genérico de API.
     * 
     * @param baseUrl - A URL base para a API.
     * @param defaultHeaders - Cabeçalhos padrão que serão usados em todas as requisições.
     */
    constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
        this.baseUrl = baseUrl
        this.defaultHeaders = defaultHeaders
    }

    /**
     * Faz uma requisição genérica a uma API com suporte para diferentes métodos, endpoint e dados.
     * 
     * @param method - O método HTTP (GET, POST, PUT, DELETE, etc.).
     * @param endpoint - O endpoint específico para a requisição.
     * @param data - Os dados a serem enviados no corpo da requisição (se aplicável).
     * @param headers - Cabeçalhos adicionais para a requisição (opcionais).
     * @returns Uma Promise com o resultado da requisição ou erro.
     */
    public async apiRequest(
        method: string,
        endpoint: string,
        data?: any,
        headers?: Record<string, string>
    ): Promise<any> {
        try {
            const config: AxiosRequestConfig = {
                method,
                url: `${this.baseUrl}/${endpoint}`,
                data,
                headers: {
                    ...this.defaultHeaders,
                    ...headers,
                },
            }

            const response = await axios(config)
            return response.data
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw {
                    message: `Falha ao fazer a requisição para ${endpoint}.`,
                    status: error.response?.status,
                    data: error.response?.data,
                    cause: error.message,
                }
            } else {
                throw {
                    message: `Erro inesperado ao fazer a requisição para ${endpoint}`,
                    cause: error.message,
                }
            }
        }
    }
}
