import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';
import { Logger } from '../../shared/utils/logger.js';
import type { IMailer, MailMessage } from './mailer.interface.js';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

/**
 * Real email delivery via SMTP. Swapped in from the composition root
 * (auth.router.ts) whenever SMTP_HOST is configured; falls back to
 * ConsoleMailer otherwise so local development never needs real SMTP
 * credentials. See email/mailer-factory.ts.
 */
export class NodemailerMailer implements IMailer {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: SmtpConfig) {
    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
    });
  }

  async send(message: MailMessage): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (error) {
      // Email delivery failures should never crash the request that
      // triggered them (e.g. signup should still succeed even if the
      // verification email fails to send) - log and move on.
      Logger.error(`Failed to send email to ${message.to}`, error);
    }
  }
}
