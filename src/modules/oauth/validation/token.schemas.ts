import { z } from 'zod';

/** RFC 7636: 43-128 chars of unreserved characters. */
const codeVerifierSchema = z
  .string()
  .regex(/^[A-Za-z0-9\-._~]{43,128}$/, 'code_verifier must be a valid RFC 7636 value.');

export const authorizationCodeGrantSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string().min(1, 'code is required.'),
  redirect_uri: z.string().url('redirect_uri must be a valid URL.'),
  client_id: z.string().min(1, 'client_id is required.'),
  client_secret: z.string().optional(),
  code_verifier: codeVerifierSchema,
});

export const refreshTokenGrantSchema = z.object({
  grant_type: z.literal('refresh_token'),
  refresh_token: z.string().min(1, 'refresh_token is required.'),
  client_id: z.string().min(1, 'client_id is required.'),
  client_secret: z.string().optional(),
});

export const SUPPORTED_GRANT_TYPES = ['authorization_code', 'refresh_token'] as const;

export const tokenRequestSchema = z.discriminatedUnion('grant_type', [
  authorizationCodeGrantSchema,
  refreshTokenGrantSchema,
]);

export type TokenRequest = z.infer<typeof tokenRequestSchema>;

export const revokeRequestSchema = z.object({
  token: z.string().min(1, 'token is required.'),
  token_type_hint: z.enum(['access_token', 'refresh_token']).optional(),
  client_id: z.string().min(1, 'client_id is required.'),
  client_secret: z.string().optional(),
});

export const introspectRequestSchema = z.object({
  token: z.string().min(1, 'token is required.'),
  token_type_hint: z.enum(['access_token', 'refresh_token']).optional(),
  client_id: z.string().min(1, 'client_id is required.'),
  client_secret: z.string().optional(),
});
