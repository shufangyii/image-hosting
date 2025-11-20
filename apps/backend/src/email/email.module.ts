import { Module } from '@nestjs/common';
import { UpstashModule } from '../upstash/upstash.module';
import { EmailService } from './email.service';
import { EmailWorkerService } from './email.worker.service';

@Module({
    imports: [UpstashModule],
    providers: [EmailService, EmailWorkerService],
    exports: [EmailService],
})
export class EmailModule { }
