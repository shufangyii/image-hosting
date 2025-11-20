import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UpstashService } from './upstash.service';

@Module({
  imports: [ConfigModule],
  providers: [UpstashService],
  exports: [UpstashService],
})
export class UpstashModule {}
