import { AppConfig } from './app.config';

export const mailerConfig = {
    host: AppConfig.SMTP_HOST,
    port: AppConfig.SMTP_PORT,
    secure: AppConfig.SMTP_PORT === 465,
    auth: {
        user: AppConfig.SMTP_USER,
        pass: AppConfig.SMTP_PASS,
    },
    from: {
        name: AppConfig.SMTP_FROM_NAME,
        address: AppConfig.SMTP_FROM_EMAIL,
    },
};
