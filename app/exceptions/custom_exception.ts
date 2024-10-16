import { Exception } from '@adonisjs/core/exceptions'

export default class CustomException extends Exception {
  static status?: number | undefined = 500;
  static code?: string | undefined = 'E_RUNTIME_EXCEPTION';
}