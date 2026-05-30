import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly database: DatabaseService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'tsukiyomi-api',
      version: '3.0.0',
      database: this.database.getMode(),
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
