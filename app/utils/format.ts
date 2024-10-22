import moment from 'moment'

/**
 * Formata um JSON recursivamente, aplicando formatações específicas a cada tipo de valor.
 * - Strings são convertidas para uppercase e são validadas como datas.
 * - Números são arredondados para duas casas decimais.
 * - Arrays e objetos são formatados recursivamente.
 * 
 * @param value - O valor de entrada a ser formatado.
 * @returns O valor formatado de acordo com o seu tipo.
 */
export function formatJSON(value: any): any {
    if (Array.isArray(value)) {
        // Se o valor for um array, aplica recursivamente em cada item.
        return value.map((item: any) => formatJSON(item))
    }

    if (typeof value === 'object' && value !== null) {
        // Se for um objeto, cria uma nova estrutura formatada.
        const formattedObject: Record<string, any> = {}

        // Itera sobre as propriedades do objeto.
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                // Formata cada valor recursivamente.
                formattedObject[key] = formatValue(value[key])
            }
        }

        return formattedObject
    }

    // Retorna o valor original se não for um array ou objeto.
    return value
}

/**
 * Formata um valor específico baseado no seu tipo:
 * - Strings: Valida como data e, se não for uma data, converte para uppercase.
 * - Números: Arredonda para duas casas decimais.
 * - Booleans: (Pode ser adicionado se necessário).
 * 
 * @param value - O valor a ser formatado.
 * @returns O valor formatado conforme o tipo detectado.
 */
export function formatValue(value: any): any {
    if (typeof value === 'string') {
        // Valida se a string é uma data válida usando o Moment.js.
        if (moment(value, moment.ISO_8601, true).isValid()) {
            // Retorna a string como está se for uma data válida.
            return moment(value).format('YYYY-MM-DD HH:mm:ss')  // Exemplo de formatação de data/hora
        }

        // Se não for uma data, converte a string para uppercase.
        return value.trim().toUpperCase()
    }

    if (typeof value === 'number') {
        // Arredonda números para duas casas decimais.
        return Number(value.toFixed(2))
    }

    // Retorna o valor original para outros tipos (por exemplo, booleans, null, etc.).
    return value
}
