import { Logger } from '../../shared/utils/logger.js';
import { ConsoleMailer } from './console.mailer.js';
import type { IMailer } from './mailer.interface.js';
import { NodemailerMailer } from './nodemailer.mailer.js';

export function createMailer(): IMailer {
  const host = process.env.SMTP_HOST;
  if (!host) {
    Logger.warn(
      'SMTP_HOST not set - using ConsoleMailer (emails will be logged, not sent). Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM in .env to send real emails.',
    );
    return new ConsoleMailer();
  }

  return new NodemailerMailer({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? `no-reply@${host}`,
  });
}
