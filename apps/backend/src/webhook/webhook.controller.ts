/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
    BadRequestException,
    Body,
    Controller,
    Headers,
    Post,
} from '@nestjs/common';
import { Webhook } from 'svix';
import { UpstashService } from '../upstash/upstash.service';

@Controller('api/webhooks')
export class WebhookController {
    constructor(private readonly upstashService: UpstashService) { }

    @Post('clerk')
    async handleClerkWebhook(
        @Headers('svix-id') svixId: string,
        @Headers('svix-timestamp') svixTimestamp: string,
        @Headers('svix-signature') svixSignature: string,
        @Body() payload: any,
    ) {
        if (!svixId || !svixTimestamp || !svixSignature) {
            throw new BadRequestException('Missing svix headers');
        }

        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
        if (!WEBHOOK_SECRET) {
            throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
        }

        const wh = new Webhook(WEBHOOK_SECRET);
        let evt: any;

        try {
            evt = wh.verify(JSON.stringify(payload), {
                'svix-id': svixId,
                'svix-timestamp': svixTimestamp,
                'svix-signature': svixSignature,
            });
        } catch (err) {
            console.error('Error verifying webhook:', err);
            throw new BadRequestException('Error verifying webhook');
        }

        const eventType = evt.type;

        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name } = evt.data;
            const email = email_addresses[0]?.email_address;
            const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';

            console.log(`User created: ${id}, ${email}`);

            if (email) {
                await this.upstashService.lpush(
                    'email-sending',
                    JSON.stringify({ email, name }),
                );
                console.log('Queued welcome email job');
            }
        }

        return { success: true };
    }
}
