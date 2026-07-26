import { HttpClient, type IdentityConfig } from './http-client.js';
import { ApiKeysModule } from './modules/api-keys.js';
import { ApplicationsModule } from './modules/applications.js';
import { AuditModule } from './modules/audits.js';
import { AuthModule } from './modules/auth.js';
import { PermissionsModule } from './modules/permissions.js';
import { RolesModule } from './modules/roles.js';
import { SessionsModule } from './modules/sessions.js';
import { TenantsModule } from './modules/tenants.js';

export class IdentityClient {
  private readonly http: HttpClient;

  readonly auth: AuthModule;
  readonly sessions: SessionsModule;
  readonly permissions: PermissionsModule;
  readonly roles: RolesModule;
  readonly tenants: TenantsModule;
  readonly applications: ApplicationsModule;
  readonly apiKeys: ApiKeysModule;
  readonly audit: AuditModule;

  constructor(config: IdentityConfig) {
    this.http = new HttpClient(config);

    this.auth = new AuthModule(this.http);
    this.sessions = new SessionsModule(this.http);
    this.permissions = new PermissionsModule(this.http);
    this.roles = new RolesModule(this.http);
    this.tenants = new TenantsModule(this.http);
    this.applications = new ApplicationsModule(this.http);
    this.apiKeys = new ApiKeysModule(this.http);
    this.audit = new AuditModule(this.http);
  }

  /** Switch this client into server-to-server mode using an Application's API key. */
  useApiKey(key: string): void {
    this.http.setApiKey(key);
  }

  /** Restore a previously-persisted session (e.g. from your own secure storage) without calling login again. */
  setTokens(tokens: { accessToken?: string; refreshToken?: string }): void {
    this.http.setTokens(tokens);
  }

  getTokens(): {
    accessToken?: string;
    refreshToken?: string;
  } {
    return this.http.getTokens();
  }

  /** Fires whenever tokens change (login, silent refresh, logout) - use this to persist them. */
  onTokensChanged(
    listener: (tokens: { accessToken?: string; refreshToken?: string }) => void,
  ): void {
    this.http.onTokens(listener);
  }
}

/**
 * Convenience factory matching the doc's `Identity.configure(...)` API shape.
 *
 * @example
 * const identity = configureIdentity({ baseUrl: "https://auth.example.com/api/v1" });
 * const user = await identity.auth.login({ username: "jane", password: "..." });
 */
export function configureIdentity(config: IdentityConfig): IdentityClient {
  return new IdentityClient(config);
}
