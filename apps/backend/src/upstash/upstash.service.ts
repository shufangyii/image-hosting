import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class UpstashService implements OnModuleInit {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const token = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

    if (!url || !token) {
      throw new Error(
        'Upstash Redis REST URL and Token must be defined in environment variables.',
      );
    }

    this.redisClient = new Redis({ url, token });
    console.log('Initialized Upstash Redis client via REST API.');
  }

  async lpush(queue: string, message: string) {
    return this.redisClient.lpush(queue, message);
  }

  async rpop(queue: string): Promise<string | null> {
    return this.redisClient.rpop(queue);
  }
}
