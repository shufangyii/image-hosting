import { Webhook } from 'svix';
import fetch from 'node-fetch';

async function run() {
    const secret = 'whsec_MfKQ9r8GKYqrS5AGfpHgBFJB079q39tj';
    if (!secret) {
        console.error('Error: CLERK_WEBHOOK_SECRET is not set.');
        process.exit(1);
    }

    const payload = JSON.stringify({
        type: 'user.created',
        data: {
            id: 'user_test123',
            email_addresses: [{ email_address: '102338496@qq.com' }],
            first_name: 'Test',
            last_name: 'User',
        },
    });

    const wh = new Webhook(secret);
    const msgId = `msg_${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000);
    // svix.sign returns the signature string
    const signature = wh.sign(msgId, new Date(timestamp * 1000), payload);

    try {
        const response = await fetch('http://localhost:3001/api/webhooks/clerk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'svix-id': msgId,
                'svix-timestamp': timestamp.toString(),
                'svix-signature': signature,
            } as any,
            body: payload,
        });

        if (response.ok) {
            console.log('Webhook sent successfully!');
        } else {
            console.error('Failed to send webhook:', await response.text());
        }
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

run();
