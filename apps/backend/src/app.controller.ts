import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ClerkGuard } from './auth/clerk.guard';
import type { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(ClerkGuard)
  @Get()
  getHello(@Req() req: Request): string {
    console.log('Authenticated user:', req.user);
    return this.appService.getHello();
  }
}
