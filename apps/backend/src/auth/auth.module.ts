import { Module } from '@nestjs/common';
import { ClerkStrategy } from './clerk.strategy';
import { ClerkGuard } from './clerk.guard';

@Module({
  providers: [ClerkStrategy, ClerkGuard],
  exports: [ClerkStrategy, ClerkGuard],
})
export class AuthModule {}
