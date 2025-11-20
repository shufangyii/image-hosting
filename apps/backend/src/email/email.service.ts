import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendWelcomeEmail(email: string, name: string) {
        try {
            const data = await this.resend.emails.send({
                from: 'Christ <contact@mrtrees.top>',
                to: [email],
                subject: 'Welcome to Image Hosting App',
                html: `<strong>Welcome, ${name}!</strong><br>We are excited to have you on board.`,
            });
            return data;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}
