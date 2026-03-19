import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

@Controller('api/auth')
export class AuthController {
  private static tokens = new Set<string>();

  constructor(private readonly config: ConfigService) {}

  @Post()
  login(@Body() body: { passcode: string }) {
    const passcode = this.config.get<string>('app.passcode');
    if (body.passcode === passcode) {
      const token = createHash('sha256')
        .update(randomBytes(32))
        .digest('hex');
      AuthController.tokens.add(token);
      return { success: true, token };
    }
    return { success: false };
  }

  validateToken(token: string): boolean {
    return AuthController.tokens.has(token);
  }
}
