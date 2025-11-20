import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { UpstashService } from '../upstash/upstash.service';
import { EmailService } from './email.service';

@Injectable()
export class EmailWorkerService {
    private isProcessing = false;

    constructor(
        private readonly upstashService: UpstashService,
        private readonly emailService: EmailService,
    ) { }

    @Interval(15000)
    async handleEmailQueue() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;

        try {
            while (true) {
                const jobData = await this.upstashService.rpop('email-sending');
                if (!jobData) {
                    break; // Queue is empty
                }

                const job = typeof jobData === 'string' ? JSON.parse(jobData) : jobData;
                console.log('Processing email job:', job);

                await this.emailService.sendWelcomeEmail(job.email, job.name);
                console.log(`Email sent to ${job.email} `);
            }
        } catch (error) {
            console.error('Error in email worker:', error);
            // TODO: Add retry logic
        } finally {
            this.isProcessing = false;
        }
    }
}
