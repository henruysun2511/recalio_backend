import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import { mailerConfig } from '../../config/mailer.config';

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private readonly transporter: Transporter;

    constructor() {
        this.transporter = createTransport({
            host: mailerConfig.host,
            port: mailerConfig.port,
            secure: mailerConfig.secure,
            auth: mailerConfig.auth.user
                ? { user: mailerConfig.auth.user, pass: mailerConfig.auth.pass }
                : undefined,
        });
    }

    async sendMail(to: string, subject: string, html: string): Promise<boolean> {
        if (!mailerConfig.auth.user) {
            this.logger.warn('SMTP not configured, skipping email to ' + to);
            return false;
        }

        try {
            await this.transporter.sendMail({
                from: `"${mailerConfig.from.name}" <${mailerConfig.from.address}>`,
                to,
                subject,
                html,
            });
            this.logger.log(`Email sent to ${to}: ${subject}`);
            return true;
        } catch (err) {
            this.logger.error(`Failed to send email to ${to}: ${(err as Error).message}`);
            return false;
        }
    }
}
