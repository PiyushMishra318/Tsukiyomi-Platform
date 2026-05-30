import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @HttpCode(403)
  forbidden() {
    return 'FORBIDDEN';
  }
}
