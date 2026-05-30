import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'tsukiyomi-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('register')
  register(@Body() body: { phone: number | string; password: string; username?: string }) {
    const phone = Number(body.phone);
    return this.authService.register(phone, body.password, body.username);
  }

  @Post('login')
  login(@Body() body: { phone: number | string; password: string }) {
    const phone = Number(body.phone);
    return this.authService.login(phone, body.password);
  }
}
