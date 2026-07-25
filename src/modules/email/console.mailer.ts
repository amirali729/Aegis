import { Logger } from '../../shared/utils/logger.js';
import type { IMailer, MailMessage } from './mailer.interface.js';

/**
 * Development/self-hosted default implementation of IMailer.
 *
 * No SMTP credentials are configured yet, so this simply logs the
 * email to the console. This keeps local development and self-hosted
 * quick-starts unblocked without requiring an email provider.
 *
 * Swap this out in production by providing a different IMailer
 * implementation (SMTP via nodemailer, Resend, SES, Postmark, etc.)
 * from the composition root (auth.router.ts / bootstrap) — nothing
 * in the service layer needs to change.
 */
export class ConsoleMailer implements IMailer {
  async send(message: MailMessage): Promise<void> {
    Logger.info('[ConsoleMailer] Email would be sent:', {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  }
}
