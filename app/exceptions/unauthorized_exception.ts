import { Exception } from '@adonisjs/core/exceptions'

export default class UnauthorizedException extends Exception {
  static status?: number | undefined = 403;
  static code?: string | undefined = 'E_FORBIDDEN';
}