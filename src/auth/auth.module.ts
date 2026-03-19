import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthController, AuthGuard],
  exports: [AuthController, AuthGuard],
})
export class AuthModule {}
