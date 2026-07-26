import type { MailMessage } from '../mailer.interface.js';

export function buildVerificationEmail(to: string, verificationUrl: string): MailMessage {
  return {
    to,
    subject: 'Verify your email address',
    text: `Welcome! Please verify your email by visiting: ${verificationUrl}\n\nThis link expires in 24 hours. If you did not create this account, you can ignore this email.`,
    html: `<p>Welcome! Please verify your email by clicking the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p><p>This link expires in 24 hours. If you did not create this account, you can ignore this email.</p>`,
  };
}

export function buildPasswordResetEmail(to: string, resetUrl: string): MailMessage {
  return {
    to,
    subject: 'Reset your password',
    text: `We received a request to reset your password. Visit this link to choose a new one: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can safely ignore this email.`,
    html: `<p>We received a request to reset your password. Click the link below to choose a new one:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>`,
  };
}
