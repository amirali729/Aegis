import { z } from 'zod';

const httpsOrLocalhostUrl = z
  .string()
  .url('Each redirect URI must be a valid URL.')
  .refine(
    (url) => url.startsWith('https://') || url.startsWith('http://localhost'),
    'Redirect URIs must use https, except for http://localhost during development.',
  );

export const createOAuthClientSchema = z.object({
  name: z.string().trim().min(2, 'Client name must be at least 2 characters.').max(100),
  redirectUris: z.array(httpsOrLocalhostUrl).min(1, 'At least one redirect URI is required.'),
  clientType: z.enum(['confidential', 'public']).optional(),
  grantTypes: z
    .array(z.enum(['authorization_code', 'refresh_token', 'client_credentials']))
    .optional(),
  scopes: z.array(z.string().trim().min(1)).optional(),
});
