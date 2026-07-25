/**
 * Framework/provider-agnostic mail contract.
 *
 * Services depend on this interface, never on a concrete provider.
 * This keeps the Hosted SaaS edition (e.g. Resend/SES) and the
 * Self-Hosted edition (e.g. SMTP, or console output for local dev)
 * fully swappable without touching business logic.
 */
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface IMailer {
  send(message: MailMessage): Promise<void>;
}
