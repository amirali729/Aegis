import { IdentityApiError, IdentityNetworkError } from './errors.js';
import type { ErrorEnvelope, SuccessEnvelope } from './types.js';

export interface IdentityConfig {
  /** Base URL of the Identity Platform API, e.g. "https://auth.example.com/api/v1" */
  baseUrl: string;
  /** Optional - reserved for future OAuth-style client flows. */
  clientId?: string;
  clientSecret?: string;
  /** Request timeout in ms. Default 15000. */
  timeoutMs?: number;
}

export interface RequestOptions {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  /** Internal use - prevents infinite refresh loops. */
  skipAuthRetry?: boolean;
}

type TokenListener = (tokens: { accessToken?: string; refreshToken?: string }) => void;

/**
 * Core HTTP layer shared by every module class (auth, sessions, roles,
 * ...). Consumers never call this directly - it exists so the SDK can
 * fulfil its "developer never touches tokens" promise (see
 * docs/SDK Architecture & Client Integration.md).
 */
export class HttpClient {
  private accessToken?: string;
  private refreshToken?: string;
  private apiKey?: string;
  private refreshInFlight?: Promise<boolean>;
  private onTokensChanged?: TokenListener;

  constructor(private readonly config: IdentityConfig) {}

  setTokens(tokens: { accessToken?: string; refreshToken?: string }): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.onTokensChanged?.(tokens);
  }

  getTokens(): {
    accessToken?: string;
    refreshToken?: string;
  } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }

  clearTokens(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.onTokensChanged?.({});
  }

  /**
   * Switches this client into server-to-server mode: every request
   * sends `X-API-Key` instead of a user session. Mutually exclusive
   * with setTokens - the last one called wins.
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Called whenever tokens change (login, refresh, logout, clear) so
   * a consumer can persist them (e.g. to a secrets store, encrypted
   * cookie, or React state) without polling.
   */
  onTokens(listener: TokenListener): void {
    this.onTokensChanged = listener;
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(path, options.query);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response: Response;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 15000);

      response = await fetch(url, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);
    } catch (cause) {
      throw new IdentityNetworkError(`Network request to ${path} failed.`, cause);
    }

    const json = (await response.json().catch(() => undefined)) as
      SuccessEnvelope<T> | ErrorEnvelope | undefined;

    if (response.ok && json && json.success) {
      return (json as SuccessEnvelope<T>).data;
    }

    const statusCode = json?.statusCode ?? response.status;
    const message = json?.message ?? `Request to ${path} failed.`;

    // Auto-refresh-and-retry, exactly once, on an expired access token.
    if (
      statusCode === 401 &&
      this.refreshToken &&
      !options.skipAuthRetry &&
      path !== '/auth/refresh'
    ) {
      const refreshed = await this.tryRefresh();

      if (refreshed) {
        return this.request<T>(method, path, {
          ...options,
          skipAuthRetry: true,
        });
      }
    }

    throw new IdentityApiError(message, statusCode, json?.timestamp);
  }

  private async tryRefresh(): Promise<boolean> {
    // Dedupe concurrent 401s into a single in-flight refresh call.
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = (async () => {
      try {
        const result = await this.request<{
          accessToken: string;
          refreshToken: string;
        }>('POST', '/auth/refresh', {
          body: { refreshToken: this.refreshToken },
          skipAuthRetry: true,
        });

        this.setTokens(result);
        return true;
      } catch {
        this.clearTokens();
        return false;
      } finally {
        this.refreshInFlight = undefined;
      }
    })();

    return this.refreshInFlight;
  }

  private buildUrl(path: string, query?: RequestOptions['query']): string {
    const base = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl
      : `${this.config.baseUrl}/`;
    const relativePath = path.startsWith('/') ? path.slice(1) : path;

    const url = new URL(relativePath, base);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }
}
