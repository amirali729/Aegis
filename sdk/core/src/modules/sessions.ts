import type { HttpClient } from '../http-client.js';
import type { Session } from '../types.js';

export class SessionsModule {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Session[]> {
    return this.http.request<Session[]>('GET', '/sessions');
  }

  async revoke(sessionId: string): Promise<void> {
    await this.http.request('DELETE', `/sessions/${sessionId}`);
  }
}
