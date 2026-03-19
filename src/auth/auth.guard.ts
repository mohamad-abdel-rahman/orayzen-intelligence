import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthController } from './auth.controller.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authController: AuthController) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-auth-token'];
    return this.authController.validateToken(token);
  }
}
