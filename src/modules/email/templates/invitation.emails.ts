import type { MailMessage } from '../mailer.interface.js';

export function buildInvitationEmail(
  to: string,
  organizationName: string,
  acceptUrl: string,
): MailMessage {
  return {
    to,
    subject: `You've been invited to join ${organizationName}`,
    text: `You've been invited to join ${organizationName} on Aegis. Accept the invitation by visiting: ${acceptUrl}\n\nThis link expires in 7 days. If you weren't expecting this, you can safely ignore this email.`,
    html: `<p>You've been invited to join <strong>${organizationName}</strong> on Aegis.</p><p><a href="${acceptUrl}">${acceptUrl}</a></p><p>This link expires in 7 days. If you weren't expecting this, you can safely ignore this email.</p>`,
  };
}
