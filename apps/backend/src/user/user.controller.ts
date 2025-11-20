import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClerkGuard } from '../auth/clerk.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(ClerkGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request.');
    }
    return this.userService.getMe(req.user);
  }
}
