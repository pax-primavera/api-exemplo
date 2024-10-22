import { Exception } from '@adonisjs/core/exceptions'

/**
 * Classe de Exceção Personalizada.
 *
 * Esta classe estende a classe `Exception` do AdonisJS para criar uma exceção
 * personalizada que pode ser usada em toda a aplicação. Ela permite definir
 * um código de erro e um status HTTP padrão para as exceções lançadas.
 */
export default class CustomException extends Exception {
  // Status HTTP padrão para a exceção.
  static status?: number | undefined = 500;

  // Código de erro padrão para a exceção.
  static code?: string | undefined = 'E_RUNTIME_EXCEPTION';
}
