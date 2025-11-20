import { Module } from '@nestjs/common';
import { UpstashModule } from '../upstash/upstash.module';
import { WebhookController } from './webhook.controller';

@Module({
    imports: [UpstashModule],
    controllers: [WebhookController],
})
export class WebhookModule { }
