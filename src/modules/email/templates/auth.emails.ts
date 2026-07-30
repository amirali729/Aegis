import type { MailMessage } from '../mailer.interface.js';
import { renderTemplate } from './email-builder.js';

export function buildVerificationEmail(to: string, verificationUrl: string): MailMessage {
  return {
    to,
    subject: 'Verify your email address',

    text: `Welcome to Aegis!

Please verify your email address by visiting:

${verificationUrl}

This verification link expires in 24 hours.

If you did not create an Aegis account, you can safely ignore this email.`,

    html: renderTemplate('verificationEmail.html', {
      verificationUrl,
      year: new Date().getFullYear().toString(),
    }),
  };
}

export function buildPasswordResetEmail(to: string, resetUrl: string): MailMessage {
  return {
    to,
    subject: 'Reset your password',

    text: `We received a request to reset your password.

Reset your password by visiting:

${resetUrl}

This password reset link expires in 1 hour.

If you did not request this password reset, you can safely ignore this email.`,

    html: renderTemplate('passwordReset.html', {
      resetUrl,
      year: new Date().getFullYear().toString(),
    }),
  };
}
